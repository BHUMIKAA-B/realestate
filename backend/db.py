"""Database connection and collection accessors for VisitSarva."""
from __future__ import annotations

import os
from urllib.parse import urlparse
from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None
_db = None


def _resolve_db_name() -> str:
    """Return DB name from DB_NAME env var, MONGO_URL path, or default."""
    if os.environ.get("DB_NAME"):
        return os.environ["DB_NAME"]
    mongo_url = os.environ.get("MONGO_URL", "")
    if mongo_url:
        path = urlparse(mongo_url).path.lstrip("/")
        if path:
            return path.split("?")[0] or "visitsarva"
    return "visitsarva"


def get_db():
    global _client, _db
    if _db is None:
        _client = AsyncIOMotorClient(os.environ["MONGO_URL"])
        _db = _client[_resolve_db_name()]
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
