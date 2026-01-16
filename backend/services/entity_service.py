from flask import json
from sqlalchemy import text
from db import engine


class EntityService:
    @staticmethod
    def _int_to_bool(value) -> bool:
        return bool(value)

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
    def get_full(entity_id: str):
        with engine.connect() as conn:
            e = conn.execute(
                text("""
                    SELECT id, title, api, form_type, component
                    FROM entities
                    WHERE LOWER(id) = LOWER(:id)
                """),
                {"id": entity_id},
            ).mappings().first()

            if not e:
                return None

            e = dict(e)

            # columns
            cols = conn.execute(
                text("""
                    SELECT id, header_name, field, renderer,
                           renderer_params, hidden, sort_order
                    FROM entity_columns
                    WHERE LOWER(entity_id) = LOWER(:id)
                    ORDER BY sort_order
                """),
                {"id": entity_id},
            ).mappings().all()

            # fields
            flds = conn.execute(
                text("""
                    SELECT id, name, label, type, required,
                           depends_on, config, sort_order
                    FROM entity_fields
                    WHERE LOWER(entity_id) = LOWER(:id)
                    ORDER BY sort_order
                """),
                {"id": entity_id},
            ).mappings().all()

            # actions (admin sees everything)
            acts = conn.execute(
                text("""
                    SELECT *
                    FROM entity_actions
                    WHERE LOWER(entity_id) = LOWER(:id)
                """),
                {"id": entity_id},
            ).mappings().all()

        # JSON parsing + boolean normalization
        parsed_cols = []
        for c in cols:
            c = dict(c)
            c["renderer_params"] = json.loads(c["renderer_params"] or "{}")
            c["hidden"] = EntityService._int_to_bool(c["hidden"])
            parsed_cols.append(c)

        parsed_flds = []
        for f in flds:
            f = dict(f)
            f["config"] = json.loads(f["config"] or "{}")
            f["required"] = EntityService._int_to_bool(f["required"])
            parsed_flds.append(f)

        parsed_acts = []
        for a in acts:
            a = dict(a)
            a["form"] = json.loads(a["form"] or "{}")
            a["dialog_options"] = json.loads(a["dialog_options"] or "{}")
            parsed_acts.append(a)

        e["columns"] = parsed_cols
        e["fields"] = parsed_flds
        e["actions"] = parsed_acts

        return e

    @staticmethod
    def list_full():
        """
        ADMIN ONLY.
        Returns a full schema dump of all entities.
        Includes internal IDs and admin-only configuration.
        NOT SAFE for frontend runtime usage.
        """
        with engine.connect() as conn:
            ids = conn.execute(
                text("SELECT id FROM entities ORDER BY created_at")
            ).scalars().all()

            entities = []
            for entity_id in ids:
                entities.append(
                    EntityService.get_full(entity_id)
                )

        return entities

    @staticmethod
    def get(entity_id: str):
        """Get single entity (case-insensitive)"""
        with engine.connect() as conn:
            row = conn.execute(
                text("""
                    SELECT id, title, api, form_type, component, created_at
                    FROM entities
                    WHERE LOWER(id) = LOWER(:id)
                """),
                {"id": entity_id},
            ).mappings().first()

        return dict(row) if row else None

    @staticmethod
    def create(data: dict):
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
        with engine.begin() as conn:
            conn.execute(
                text("""
                    DELETE FROM entities
                    WHERE LOWER(id) = LOWER(:id)
                """),
                {"id": entity_id},
            )
