#!/usr/bin/env python3
"""
Seed metadata-driven entities, forms, columns, row data, and actions.

Usage:
  python seed_data.py
  python seed_data.py --reset
"""

import argparse
import json
from sqlalchemy import text
from db import engine
from sample_data import ENTITIES

# -----------------------------
# Seeder Logic
# -----------------------------

def seed(reset: bool = False):
    with engine.begin() as conn:
        if reset:
            conn.execute(text("DELETE FROM entity_actions"))
            conn.execute(text("DELETE FROM entity_rows"))
            conn.execute(text("DELETE FROM entity_fields"))
            conn.execute(text("DELETE FROM entity_columns"))
            conn.execute(text("DELETE FROM entities"))
            print("🧹 Database reset complete.")

        for entity in ENTITIES:
            # Insert entity
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

            # Insert columns
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
                        "rp": json.dumps(col.get("rendererParams")) if col.get("rendererParams") else None,
                        "hidden": col.get("hidden", False),
                        "o": order,
                    },
                )

            # Insert fields
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

            # Insert rows
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

            # Insert actions
            for action in entity.get("actions", []):
                conn.execute(
                    text("""
                        INSERT INTO entity_actions
                        (id, entity_id, label, tooltip, type, icon, icon_color, form, api, method, confirm, handler, dialog_options)
                        VALUES (:id, :eid, :label, :tooltip, :type, :icon, :icon_color, :form, :api, :method, :confirm, :handler, :dialog_options)
                    """),
                    {
                        "id": action["id"],
                        "eid": entity["id"],
                        "label": action["label"],
                        "tooltip": action.get("tooltip"),
                        "type": action["type"],
                        "icon": action.get("icon"),
                        "icon_color": action.get("iconColor"),
                        "form": json.dumps(action.get("form")) if action.get("form") else None,
                        "api": action.get("api"),
                        "method": action.get("method"),
                        "confirm": action.get("confirm"),
                        "handler": action.get("handler"),
                        "dialog_options": json.dumps(action.get("dialogOptions")) if action.get("dialogOptions") else None,
                    },
                )

    print("✅ Metadata, rows, and actions seeded successfully.")


# -----------------------------
# Entry Point
# -----------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed metadata-driven entities")
    parser.add_argument("--reset", action="store_true", help="Reset tables before seeding")
    args = parser.parse_args()

    seed(args.reset)