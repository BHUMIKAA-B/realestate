"""JWT + password hashing utilities."""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

import db

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def hash_password(p: str) -> str:
    return _pwd.hash(p)


def verify_password(p: str, h: str) -> bool:
    try:
        return _pwd.verify(p, h)
    except Exception:
        return False


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def _refresh_secret() -> str:
    return os.environ.get("JWT_REFRESH_SECRET", os.environ["JWT_SECRET"] + "_r")


def create_access_token(user_id: str, role: str) -> str:
    minutes = int(os.environ.get("ACCESS_TOKEN_TTL_MINUTES", "120"))
    exp = datetime.now(timezone.utc) + timedelta(minutes=minutes)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": exp, "type": "access"},
        _secret(),
        algorithm="HS256",
    )


def create_refresh_token(user_id: str, role: str) -> str:
    days = int(os.environ.get("REFRESH_TOKEN_TTL_DAYS", "14"))
    exp = datetime.now(timezone.utc) + timedelta(days=days)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": exp, "type": "refresh"},
        _refresh_secret(),
        algorithm="HS256",
    )


def decode_refresh(token: str) -> dict:
    return jwt.decode(token, _refresh_secret(), algorithms=["HS256"])


async def _user_from_token(token: Optional[str]) -> Optional[dict]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, _secret(), algorithms=["HS256"])
    except JWTError:
        return None
    uid = payload.get("sub")
    if not uid:
        return None
    user = await db.users().find_one({"id": uid}, {"_id": 0, "password_hash": 0})
    return user


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    user = await _user_from_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    return user


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[dict]:
    return await _user_from_token(token)


def require_roles(*roles: str):
    async def _checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user

    return _checker
