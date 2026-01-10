#!/usr/bin/env python3
"""
Seed metadata-driven entities, forms, columns, and row data

Usage:
  python seed_data.py
  python seed_data.py --reset
"""

import argparse
import json
from sqlalchemy import text
from db import engine

# -----------------------------
# Metadata Definitions
# -----------------------------

ENTITIES = [
    {
        "id": "A",
        "title": "Schema Form A",
        "api": "/api/a",
        "form_type": "schema",
        "columns": [
            {"header": "Name", "field": "name"},
            {"header": "Age", "field": "age"},
            {"header": "Country", "field": "country"},
            {"header": "State", "field": "state"},
            {"header": "BirthDate", "field": "birthDate"},
            {
                "header": "Salary",
                "field": "salary",
                "renderer": "price",
                "rendererParams": {"currencyField": "currency"},
            },
            {"header": "Currency", "field": "currency", "hidden": True},
        ],
        "fields": [
            {"name": "name", "label": "Name", "type": "text", "required": True},
            {"name": "age", "label": "Age", "type": "number"},
            {"name": "country", "label": "Country", "type": "dynamic-select"},
            {"name": "state", "label": "State", "type": "dynamic-select", "dependsOn": "country"},
            {"name": "birthDate", "label": "Birth Date", "type": "date"},
            {"name": "salary", "label": "Salary", "type": "number"},
            {"name": "currency", "label": "Currency", "type": "select"},
        ],
        "rows": [
            {
                "name": "John Doe",
                "age": 30,
                "state": "NY",
                "country": "US",
                "birthDate": "1993-05-15",
                "salary": 60000,
                "currency": "USD",
            },
            {
                "name": "Jane Smith",
                "age": 25,
                "state": "NJ",
                "country": "US",
                "birthDate": "1998-08-22",
                "salary": 75000,
                "currency": "USD",
            },
            {
                "name": "Alice Johnson",
                "age": 28,
                "state": "NC",
                "country": "US",
                "birthDate": "1995-12-03",
                "salary": 80000,
                "currency": "USD",
            },
            {
                "name": "Bob Brown",
                "age": 41,
                "state": "KA",
                "country": "IN",
                "birthDate": "1982-11-11",
                "salary": 1200000,
                "currency": "INR",
            },
        ],
    },

    {
        "id": "schemaForm2",
        "title": "Schema Form 2",
        "api": "/api/schemaForm2",
        "form_type": "schema",
        "columns": [
            {"header": "Title", "field": "title"},
            {"header": "Type", "field": "type"},
            {"header": "Active Status", "field": "isActive", "renderer": "checkbox"},
        ],
        "fields": [
            {"name": "title", "label": "Title", "type": "text", "required": True},
            {"name": "type", "label": "Type", "type": "select"},
            {"name": "isActive", "label": "Active Status", "type": "checkbox"},
        ],
        "rows": [
            {"title": "Sample Title 1", "type": "A", "isActive": True},
            {"title": "Sample Title 2", "type": "B", "isActive": False},
            {"title": "Sample Title 3", "type": "A", "isActive": True},
        ],
    },

    {
        "id": "B",
        "title": "Custom Form B",
        "api": "/api/b",
        "form_type": "component",
        "component": "FormB",
        "columns": [
            {"header": "Title", "field": "title"},
            {"header": "Active Status", "field": "isActive"},
        ],
        "rows": [
            {"title": "Sample Title", "isActive": True},
            {"title": "Another Title", "isActive": False},
            {"title": "Third Title", "isActive": True},
        ],
    },

    {
        "id": "C",
        "title": "Custom Form C",
        "api": "/api/c",
        "form_type": "component",
        "component": "FormC",
        "columns": [
            {"header": "Description", "field": "description"},
            {"header": "Quantity", "field": "quantity"},
        ],
        "rows": [
            {"description": "This is a sample description.", "quantity": 100},
            {"description": "Another description here.", "quantity": 250},
            {"description": "More descriptions.", "quantity": 75},
        ],
    },

    {
        "id": "D",
        "title": "Schema Form D with Dynamic Select",
        "api": "/api/d",
        "form_type": "schema",
        "columns": [
            {"header": "Item Name", "field": "itemName"},
            {"header": "Category", "field": "category"},
        ],
        "fields": [
            {"name": "itemName", "label": "Item Name", "type": "text", "required": True},
            {"name": "category", "label": "Category", "type": "dynamic-select"},
        ],
        "rows": [
            {"itemName": "Item 1", "category": "Category A"},
            {"itemName": "Item 2", "category": "Category B"},
            {"itemName": "Item 3", "category": "Category A"},
        ],
    },

    {
        "id": "E",
        "title": "Schema Form E with Dependent Fields",
        "api": "/api/e",
        "form_type": "schema",
        "columns": [
            {"header": "Country", "field": "country"},
            {"header": "State", "field": "state"},
        ],
        "fields": [
            {"name": "country", "label": "Country", "type": "dynamic-select"},
            {"name": "state", "label": "State", "type": "dynamic-select", "dependsOn": "country"},
        ],
        "rows": [
            {"country": "US", "state": "NY"},
            {"country": "US", "state": "CA"},
            {"country": "CA", "state": "ON"},
        ],
    },
]


# -----------------------------
# Seeder Logic
# -----------------------------

def seed(reset: bool = False):
    with engine.begin() as conn:
        if reset:
            conn.execute(text("DELETE FROM entity_rows"))
            conn.execute(text("DELETE FROM entity_fields"))
            conn.execute(text("DELETE FROM entity_columns"))
            conn.execute(text("DELETE FROM entities"))
            print("🧹 Database reset complete.")

        for entity in ENTITIES:
            conn.execute(
                text("""
                    INSERT INTO entities (id, title, api, form_type, component)
                    VALUES (:id, :title, :api, :form_type, :component)
                """),
                {
                    "id": entity["id"],
                    "title": entity["title"],
                    "api": entity["api"],
                    "form_type": entity["form_type"],
                    "component": entity.get("component"),
                },
            )

            for order, col in enumerate(entity["columns"]):
                conn.execute(
                    text("""
                        INSERT INTO entity_columns
                        (entity_id, header_name, field, renderer, renderer_params, hidden, sort_order)
                        VALUES (:eid, :h, :f, :r, :rp, :hidden, :o)
                    """),
                    {
                        "eid": entity["id"],
                        "h": col["header"],
                        "f": col["field"],
                        "r": col.get("renderer"),
                        "rp": json.dumps(col.get("rendererParams")),
                        "hidden": col.get("hidden", False),
                        "o": order,
                    },
                )

            for order, field in enumerate(entity.get("fields", [])):
                conn.execute(
                    text("""
                        INSERT INTO entity_fields
                        (entity_id, name, label, type, required, depends_on, config, sort_order)
                        VALUES (:eid, :n, :l, :t, :req, :dep, :cfg, :o)
                    """),
                    {
                        "eid": entity["id"],
                        "n": field["name"],
                        "l": field["label"],
                        "t": field["type"],
                        "req": field.get("required", False),
                        "dep": field.get("dependsOn"),
                        "cfg": json.dumps(field),
                        "o": order,
                    },
                )

            for row in entity.get("rows", []):
                conn.execute(
                    text("""
                        INSERT INTO entity_rows (entity_id, data)
                        VALUES (:eid, :data)
                    """),
                    {
                        "eid": entity["id"],
                        "data": json.dumps(row),
                    },
                )

    print("✅ Metadata + row data seeded successfully.")


# -----------------------------
# Entry Point
# -----------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed metadata-driven entities")
    parser.add_argument("--reset", action="store_true", help="Reset tables before seeding")
    args = parser.parse_args()

    seed(args.reset)
