"""Database connection and collection accessors for VisitSarva."""
from __future__ import annotations

import os
from urllib.parse import urlparse

from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None
_db = None


def _resolve_db_name() -> str:
    """Resolve database name from DB_NAME env var or MONGO_URL path, with a safe default."""
    explicit = os.environ.get("DB_NAME", "").strip()
    if explicit:
        return explicit
    # Try to extract from the URL path, e.g. mongodb+srv://host/dbname
    url = os.environ.get("MONGO_URL", "")
    try:
        parsed = urlparse(url)
        path = (parsed.path or "").lstrip("/").split("?")[0].strip()
        if path:
            return path
    except Exception:
        pass
    return "visitsarva"


def get_db():
    global _client, _db
    if _db is None:
        mongo_url = os.environ["MONGO_URL"]
        db_name = _resolve_db_name()
        _client = AsyncIOMotorClient(mongo_url)
        _db = _client[db_name]
    return _db


def users():
    return get_db()["users"]


def properties():
    return get_db()["properties"]


def enquiries():
    return get_db()["enquiries"]


def service_requests():
    return get_db()["service_requests"]


def notifications():
    return get_db()["notifications"]
