import json
from sqlalchemy import text
from db import engine


class FieldService:
    @staticmethod
    def _bool_to_int(value) -> int:
        return 1 if value else 0

    @staticmethod
    def _int_to_bool(value) -> bool:
        return bool(value)

    @staticmethod
    def list(entity_id: str):
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, name, label, type, required, config, depends_on, sort_order
                    FROM entity_fields
                    WHERE LOWER(entity_id) = LOWER(:eid)
                    ORDER BY sort_order ASC
                """),
                {"eid": entity_id},
            ).mappings().all()

        result = []
        for r in rows:
            row = dict(r)
            # Convert required: 0/1 → bool
            row["required"] = FieldService._int_to_bool(row["required"])
            # Parse JSON config if present and normalize requiredIf
            try:
                cfg = json.loads(row.get("config") or "{}")
            except Exception:
                cfg = {}
            # No legacy token handling; expecting `requiredIf.operator` (equals|present)

            # merge config keys into row (config may contain requiredIf, etc.)
            row.update(cfg)
            result.append(row)
        return result

    @staticmethod
    def create(entity_id: str, data: dict):
        data = data.copy()
        # Convert required: bool → 0/1
        data["required"] = FieldService._bool_to_int(data.get("required", False))
        # Merge top-level requiredIf into config if present (accept UI shape)
        cfg = data.get("config") or {}
        if data.get("requiredIf") is not None and "requiredIf" not in cfg:
            cfg = dict(cfg)
            cfg["requiredIf"] = data.get("requiredIf")

        # ensure config serializable
        config_str = json.dumps(cfg or {})
        with engine.begin() as conn:
            res = conn.execute(
                text("""
                    INSERT INTO entity_fields (
                        entity_id, name, label, type,
                        required, config, depends_on, sort_order
                    )
                    VALUES (
                        :entity_id, :name, :label, :type,
                        :required, :config, :depends_on, :sort_order
                    )
                """),
                {"entity_id": entity_id, "config": config_str, **data},
            )
            return res.lastrowid

    @staticmethod
    def update(entity_id: str, field_id: int, data: dict):
        data = data.copy()
        # Convert required: bool → 0/1
        data["required"] = FieldService._bool_to_int(data.get("required", False))
        # Merge top-level requiredIf into config if present
        cfg = data.get("config") or {}
        if data.get("requiredIf") is not None and "requiredIf" not in cfg:
            cfg = dict(cfg)
            cfg["requiredIf"] = data.get("requiredIf")

        config_str = json.dumps(cfg or {})
        with engine.begin() as conn:
            conn.execute(
                text("""
                    UPDATE entity_fields
                    SET name = :name,
                        label = :label,
                        type = :type,
                        required = :required,
                        config = :config,
                        depends_on = :depends_on,
                        sort_order = :sort_order
                    WHERE id = :id
                      AND LOWER(entity_id) = LOWER(:entity_id)
                """),
                {"id": field_id, "entity_id": entity_id, "config": config_str, **data},
            )

    @staticmethod
    def delete(entity_id: str, field_id: int):
        with engine.begin() as conn:
            conn.execute(
                text("""
                    DELETE FROM entity_fields
                    WHERE id = :id
                      AND LOWER(entity_id) = LOWER(:entity_id)
                """),
                {"id": field_id, "entity_id": entity_id},
            )
