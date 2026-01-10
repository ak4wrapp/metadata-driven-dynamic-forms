# backend/services/column_service.py
import json
from sqlalchemy import text
from db import engine

class ColumnService:
    @staticmethod
    def list(entity_id: str):
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, header_name, field, renderer, renderer_params, hidden, sort_order
                    FROM entity_columns
                    WHERE entity_id = :eid
                    ORDER BY sort_order ASC
                """),
                {"eid": entity_id},
            ).mappings().all()

        # Parse renderer_params JSON
        for r in rows:
            if r["renderer_params"]:
                r["renderer_params"] = json.loads(r["renderer_params"])
        return [dict(r) for r in rows]

    @staticmethod
    def create(entity_id: str, data: dict):
        data["renderer_params"] = json.dumps(data.get("renderer_params", {}))
        with engine.begin() as conn:
            res = conn.execute(
                text("""
                    INSERT INTO entity_columns (entity_id, header_name, field, renderer, renderer_params, hidden, sort_order)
                    VALUES (:entity_id, :header_name, :field, :renderer, :renderer_params, :hidden, :sort_order)
                """),
                {"entity_id": entity_id, **data},
            )
            return res.lastrowid

    @staticmethod
    def update(entity_id: str, column_id: int, data: dict):
        data["renderer_params"] = json.dumps(data.get("renderer_params", {}))
        with engine.begin() as conn:
            conn.execute(
                text("""
                    UPDATE entity_columns
                    SET header_name = :header_name,
                        field = :field,
                        renderer = :renderer,
                        renderer_params = :renderer_params,
                        hidden = :hidden,
                        sort_order = :sort_order
                    WHERE id = :id AND entity_id = :entity_id
                """),
                {"id": column_id, "entity_id": entity_id, **data},
            )

    @staticmethod
    def delete(entity_id: str, column_id: int):
        with engine.begin() as conn:
            conn.execute(
                text("""
                    DELETE FROM entity_columns
                    WHERE id = :id AND entity_id = :entity_id
                """),
                {"id": column_id, "entity_id": entity_id},
            )
