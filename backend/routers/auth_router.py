"""Authentication routes."""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone

import db
import auth as auth_utils
from models import UserRegister, UserLogin, UserPublic, new_id, now_iso

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _to_public(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"],
        "is_active": user.get("is_active", True),
        "saved_properties": user.get("saved_properties", []),
        "created_at": user.get("created_at"),
    }


@router.post("/register")
async def register(payload: UserRegister):
    if payload.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot self-register as admin")
    existing = await db.users().find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = {
        "id": new_id(),
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "phone": payload.phone.strip(),
        "password_hash": auth_utils.hash_password(payload.password),
        "role": payload.role,
        "is_active": True,
        "is_verified": False,
        "is_phone_verified": False,
        "saved_properties": [],
        "created_at": now_iso(),
        "updated_at": now_iso(),
    }
    await db.users().insert_one(user)
    # Welcome email (logs if no Resend key)
    try:
        from services.email import send_email, tpl_welcome
        subject, html = tpl_welcome(user["name"], user["role"])
        await send_email(user["email"], subject, html)
    except Exception:
        pass
    access = auth_utils.create_access_token(user["id"], user["role"])
    refresh = auth_utils.create_refresh_token(user["id"], user["role"])
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": _to_public(user),
    }


@router.post("/login")
async def login(payload: UserLogin):
    user = await db.users().find_one({"email": payload.email.lower()})
    if not user or not auth_utils.verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    access = auth_utils.create_access_token(user["id"], user["role"])
    refresh = auth_utils.create_refresh_token(user["id"], user["role"])
    # Login history (last 10)
    await db.users().update_one(
        {"id": user["id"]},
        {
            "$push": {
                "login_history": {
                    "$each": [{"timestamp": now_iso()}],
                    "$slice": -10,
                }
            }
        },
    )
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": _to_public(user),
    }


@router.post("/refresh-token")
async def refresh(body: dict):
    token = body.get("refresh_token")
    if not token:
        raise HTTPException(status_code=400, detail="refresh_token required")
    try:
        payload = auth_utils.decode_refresh(token)
        if payload.get("type") != "refresh":
            raise ValueError("Wrong token type")
        uid = payload["sub"]
        role = payload["role"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user = await db.users().find_one({"id": uid})
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return {
        "access_token": auth_utils.create_access_token(uid, role),
        "token_type": "bearer",
    }


@router.get("/me")
async def me(user: dict = Depends(auth_utils.get_current_user)):
    return _to_public(user)
