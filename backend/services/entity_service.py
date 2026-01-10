# services/entity_service.py
from flask import json
from sqlalchemy import text
from db import engine


class EntityService:
    @staticmethod
    def list():
        """List all entities"""
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, title, api, form_type, component, created_at
                    FROM entities
                    ORDER BY created_at DESC
                """)
            ).mappings().all()

        return [dict(row) for row in rows]
    
    @staticmethod
    def list_full():
        with engine.connect() as conn:
            # Get entities
            entities = conn.execute(
                text("""
                    SELECT id, title, api, form_type, component
                    FROM entities
                    ORDER BY created_at DESC
                """)
            ).mappings().all()

            full_entities = []
            for e in entities:
                e = dict(e)  # make mutable

                # Columns
                cols = conn.execute(
                    text("""
                        SELECT id, header_name, field, renderer, renderer_params, hidden, sort_order
                        FROM entity_columns
                        WHERE entity_id = :eid
                        ORDER BY sort_order ASC
                    """),
                    {"eid": e["id"]},
                ).mappings().all()
                cols = [dict(c) for c in cols]
                for c in cols:
                    try:
                        c["renderer_params"] = json.loads(c["renderer_params"]) if c["renderer_params"] else {}
                    except (TypeError, json.JSONDecodeError):
                        c["renderer_params"] = {}

                # Fields
                flds = conn.execute(
                    text("""
                        SELECT id, name, label, type, required, depends_on, config, sort_order
                        FROM entity_fields
                        WHERE entity_id = :eid
                        ORDER BY sort_order ASC
                    """),
                    {"eid": e["id"]},
                ).mappings().all()
                flds = [dict(f) for f in flds]
                for f in flds:
                    try:
                        f["config"] = json.loads(f["config"]) if f["config"] else {}
                    except (TypeError, json.JSONDecodeError):
                        f["config"] = {}

                e["columns"] = cols
                e["fields"] = flds

                full_entities.append(e)

        return full_entities

    @staticmethod
    def get(entity_id: str):
        """Get single entity"""
        with engine.connect() as conn:
            row = conn.execute(
                text("""
                    SELECT id, title, api, form_type, component, created_at
                    FROM entities
                    WHERE id = :id
                """),
                {"id": entity_id},
            ).mappings().first()

        return dict(row) if row else None

    @staticmethod
    def create(data: dict):
        """
        data = {
            "id": "users",
            "title": "Users",
            "api": "/api/users",
            "form_type": "schema",
            "component": null
        }
        """
        with engine.begin() as conn:
            conn.execute(
                text("""
                    INSERT INTO entities (id, title, api, form_type, component)
                    VALUES (:id, :title, :api, :form_type, :component)
                """),
                data,
            )

        return data["id"]

    @staticmethod
    def delete(entity_id: str):
        """Delete entity (cascades to rows, fields, columns)"""
        with engine.begin() as conn:
            conn.execute(
                text("""
                    DELETE FROM entities WHERE id = :id
                """),
                {"id": entity_id},
            )
