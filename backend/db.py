# db.py
from sqlalchemy import create_engine

engine = create_engine(
    "sqlite:///metadata.db",
    connect_args={"check_same_thread": False}
)