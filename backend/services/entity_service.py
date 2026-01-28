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
                    SELECT id, name, label, type, required, config,
                           depends_on, options_api, option_label, option_value, sort_order
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
            f["required"] = EntityService._int_to_bool(f["required"])
            # Map DB columns to API keys (camelCase)
            if f.get("options_api") is not None:
                f["optionsAPI"] = f.pop("options_api")
            if f.get("option_label") is not None:
                f["optionLabel"] = f.pop("option_label")
            if f.get("option_value") is not None:
                f["optionValue"] = f.pop("option_value")

            # Parse and merge JSON config if present, normalize legacy token
            try:
                cfg = json.loads(f.get("config") or "{}")
            except Exception:
                cfg = {}

            # No legacy token handling; expecting `requiredIf.operator` (equals|present)

            # Merge config keys to top-level (e.g., requiredIf)
            f.update(cfg)
            # Remove raw config key (already merged)
            if "config" in f:
                del f["config"]

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

    @staticmethod
    def update_full(entity_id: str, data: dict):
        """
        ADMIN ONLY.
        Replaces full entity schema (entity + columns + fields + actions).
        Accepts camelCase or snake_case payloads.
        """
        with engine.begin() as conn:
            # --- update base entity ---
            conn.execute(
                text("""
                    UPDATE entities
                    SET title = :title,
                        api = :api,
                        form_type = :form_type,
                        component = :component
                    WHERE LOWER(id) = LOWER(:id)
                """),
                {
                    "id": entity_id,
                    "title": data.get("title"),
                    "api": data.get("api"),
                    "form_type": data.get("form_type") or data.get("formType"),
                    "component": data.get("component"),
                },
            )

            # --- wipe dependent tables ---
            conn.execute(
                text("DELETE FROM entity_columns WHERE LOWER(entity_id) = LOWER(:id)"),
                {"id": entity_id},
            )
            conn.execute(
                text("DELETE FROM entity_fields WHERE LOWER(entity_id) = LOWER(:id)"),
                {"id": entity_id},
            )
            conn.execute(
                text("DELETE FROM entity_actions WHERE LOWER(entity_id) = LOWER(:id)"),
                {"id": entity_id},
            )

            # --- reinsert columns ---
            for c in data.get("columns", []):
                conn.execute(
                    text("""
                        INSERT INTO entity_columns (
                            id, entity_id, header_name, field,
                            renderer, renderer_params, hidden, sort_order
                        )
                        VALUES (
                            :id, :entity_id, :header_name, :field,
                            :renderer, :renderer_params, :hidden, :sort_order
                        )
                    """),
                    {
                        "id": c.get("id"),
                        "entity_id": entity_id,
                        "header_name": c.get("header_name") or c.get("headerName"),
                        "field": c.get("field"),
                        "renderer": c.get("renderer"),
                        "renderer_params": json.dumps(
                            c.get("renderer_params") or c.get("rendererParams", {})
                        ),
                        "hidden": int(bool(c.get("hidden"))),
                        "sort_order": c.get("sort_order", c.get("sortOrder", 0)),
                    },
                )

            # --- reinsert fields ---
            for f in data.get("fields", []):
                # Build config JSON: prefer explicit `config` key, but also
                # accept top-level keys (e.g., `requiredIf`) from UI and merge them.
                cfg = f.get("config") or {}
                # If UI sent known rule keys at top-level, merge them into cfg
                if f.get("requiredIf") is not None and "requiredIf" not in cfg:
                    cfg = dict(cfg)
                    cfg["requiredIf"] = f.get("requiredIf")

                conn.execute(
                    text("""
                        INSERT INTO entity_fields (
                            id, entity_id, name, label, type,
                            required, depends_on, config, sort_order
                        )
                        VALUES (
                            :id, :entity_id, :name, :label, :type,
                            :required, :depends_on, :config, :sort_order
                        )
                    """),
                    {
                        "id": f.get("id"),
                        "entity_id": entity_id,
                        "name": f.get("name"),
                        "label": f.get("label"),
                        "type": f.get("type"),
                        "required": int(bool(f.get("required"))),
                        "depends_on": f.get("depends_on") or f.get("dependsOn"),
                        "config": json.dumps(cfg or {}),
                        "sort_order": f.get("sort_order", f.get("sortOrder", 0)),
                    },
                )

            # --- reinsert actions ---
            for a in data.get("actions", []):
                conn.execute(
                    text("""
                        INSERT INTO entity_actions (
                            id, entity_id, name, label, type,
                            form, dialog_options
                        )
                        VALUES (
                            :id, :entity_id, :name, :label, :type,
                            :form, :dialog_options
                        )
                    """),
                    {
                        "id": a["id"],
                        "entity_id": entity_id,
                        "name": a.get("name"),
                        "label": a.get("label"),
                        "type": a.get("type"),
                        "form": json.dumps(
                            a.get("form", {})
                        ),
                        "dialog_options": json.dumps(
                            a.get("dialog_options") or a.get("dialogOptions", {})
                        ),
                    },
                )
