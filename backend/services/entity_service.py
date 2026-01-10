# backend/services/entity_service.py
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
                    ORDER BY id
                """),
                {"id": entity_id},
            ).mappings().all()

        # JSON parsing
        parsed_cols = []
        for c in cols:
            c = dict(c)
            c["renderer_params"] = json.loads(c["renderer_params"] or "{}")
            parsed_cols.append(c)

        parsed_flds = []
        for f in flds:
            f = dict(f)
            f["config"] = json.loads(f["config"] or "{}")
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
                        WHERE LOWER(entity_id) = LOWER(:eid)
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
                        WHERE LOWER(entity_id) = LOWER(:eid)
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

                # Actions
                acts = conn.execute(
                    text("""
                        SELECT id, label, tooltip, type, icon, icon_color, form, api, method, confirm, handler, dialog_options
                        FROM entity_actions
                        WHERE LOWER(entity_id) = LOWER(:eid)
                        ORDER BY id ASC
                    """),
                    {"eid": e["id"]},
                ).mappings().all()
                acts = [dict(a) for a in acts]
                for a in acts:
                    if a.get("form"):
                        try:
                            a["form"] = json.loads(a["form"])
                        except (TypeError, json.JSONDecodeError):
                            a["form"] = {}
                    if a.get("dialog_options"):
                        try:
                            a["dialog_options"] = json.loads(a["dialog_options"])
                        except (TypeError, json.JSONDecodeError):
                            a["dialog_options"] = {}

                e["columns"] = cols
                e["fields"] = flds
                e["actions"] = acts

                full_entities.append(e)

        return full_entities


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
