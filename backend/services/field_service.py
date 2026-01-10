# backend/services/field_service.py
import json
from sqlalchemy import text
from db import engine


class FieldService:
    @staticmethod
    def list(entity_id: str):
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, name, label, type, required, depends_on, config, sort_order
                    FROM entity_fields
                    WHERE LOWER(entity_id) = LOWER(:eid)
                    ORDER BY sort_order ASC
                """),
                {"eid": entity_id},
            ).mappings().all()

        for r in rows:
            if r["config"]:
                r["config"] = json.loads(r["config"])
        return [dict(r) for r in rows]

    @staticmethod
    def create(entity_id: str, data: dict):
        data["config"] = json.dumps(data.get("config", {}))
        with engine.begin() as conn:
            res = conn.execute(
                text("""
                    INSERT INTO entity_fields (entity_id, name, label, type, required, depends_on, config, sort_order)
                    VALUES (:entity_id, :name, :label, :type, :required, :depends_on, :config, :sort_order)
                """),
                {"entity_id": entity_id, **data},
            )
            return res.lastrowid

    @staticmethod
    def update(entity_id: str, field_id: int, data: dict):
        data["config"] = json.dumps(data.get("config", {}))
        with engine.begin() as conn:
            conn.execute(
                text("""
                    UPDATE entity_fields
                    SET name = :name,
                        label = :label,
                        type = :type,
                        required = :required,
                        depends_on = :depends_on,
                        config = :config,
                        sort_order = :sort_order
                    WHERE id = :id AND LOWER(entity_id) = LOWER(:entity_id)
                """),
                {"id": field_id, "entity_id": entity_id, **data},
            )

    @staticmethod
    def delete(entity_id: str, field_id: int):
        with engine.begin() as conn:
            conn.execute(
                text("""
                    DELETE FROM entity_fields
                    WHERE id = :id AND LOWER(entity_id) = LOWER(:entity_id)
                """),
                {"id": field_id, "entity_id": entity_id},
            )
