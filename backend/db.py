"""Database connection and collection accessors for VisitSarva."""
from __future__ import annotations

import os
from motor.motor_asyncio import AsyncIOMotorClient

_client: AsyncIOMotorClient | None = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        _client = AsyncIOMotorClient(os.environ["MONGO_URL"])
        _db = _client[os.environ["DB_NAME"]]
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
