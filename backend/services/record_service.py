# services/record_service.py
import json
from sqlalchemy import text
from db import engine


class RecordService:
    @staticmethod
    def list(entity_id: str):
        with engine.connect() as conn:
            rows = conn.execute(
                text("""
                    SELECT id, data, created_at
                    FROM entity_rows
                    WHERE entity_id = :eid
                    ORDER BY id DESC
                """),
                {"eid": entity_id},
            ).mappings().all()

        return [
            {
                "id": r["id"],
                **json.loads(r["data"]),
                "created_at": r["created_at"],
            }
            for r in rows
        ]

    @staticmethod
    def get(entity_id: str, record_id: int):
        with engine.connect() as conn:
            row = conn.execute(
                text("""
                    SELECT id, data, created_at
                    FROM entity_rows
                    WHERE id = :id AND entity_id = :eid
                """),
                {"id": record_id, "eid": entity_id},
            ).mappings().first()

        if not row:
            return None

        return {
            "id": row["id"],
            **json.loads(row["data"]),
            "created_at": row["created_at"],
        }

    @staticmethod
    def create(entity_id: str, data: dict):
        with engine.begin() as conn:
            res = conn.execute(
                text("""
                    INSERT INTO entity_rows (entity_id, data)
                    VALUES (:eid, :data)
                """),
                {
                    "eid": entity_id,
                    "data": json.dumps(data),
                },
            )

            return res.lastrowid

    @staticmethod
    def update(entity_id: str, record_id: int, data: dict):
        with engine.begin() as conn:
            conn.execute(
                text("""
                    UPDATE entity_rows
                    SET data = :data
                    WHERE id = :id AND entity_id = :eid
                """),
                {
                    "id": record_id,
                    "eid": entity_id,
                    "data": json.dumps(data),
                },
            )

    @staticmethod
    def delete(entity_id: str, record_id: int):
        with engine.begin() as conn:
            conn.execute(
                text("""
                    DELETE FROM entity_rows
                    WHERE id = :id AND entity_id = :eid
                """),
                {"id": record_id, "eid": entity_id},
            )
