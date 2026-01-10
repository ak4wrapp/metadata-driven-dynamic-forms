from db import engine
from sqlalchemy import text

with engine.begin() as conn:
    with open("schema.sql") as f:
        sql = f.read()
        # Execute each statement separately because SQLite's DB-API
        # does not allow executing multiple statements at once.
        for statement in [s.strip() for s in sql.split(';')]:
            if statement:
                conn.execute(text(statement))

print("SQLite database initialized (metadata.db)")