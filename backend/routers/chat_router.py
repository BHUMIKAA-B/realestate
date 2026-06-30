"""Chat router — proxies messages to the configured n8n webhook."""
from __future__ import annotations

import logging
import os
import uuid
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user

log = logging.getLogger("visitsarva")
router = APIRouter(prefix="/api/chat", tags=["chat"])

N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class UserContext(BaseModel):
    id: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_context: Optional[UserContext] = None


class ChatMessageResponse(BaseModel):
    reply: str
    session_id: str


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(body: ChatMessageRequest):
    """Forward a user message to n8n and return the reply."""

    if not N8N_WEBHOOK_URL:
        raise HTTPException(
            status_code=503,
            detail="Chatbot is not configured yet. Set the N8N_WEBHOOK_URL environment variable.",
        )

    session_id = body.session_id or str(uuid.uuid4())

    payload = {
        "message": body.message,
        "session_id": session_id,
        "user": body.user_context.model_dump() if body.user_context else None,
        "source": "visitsarva-web",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(N8N_WEBHOOK_URL, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except httpx.TimeoutException:
        log.error("n8n webhook timed out")
        raise HTTPException(status_code=504, detail="Chatbot service timed out. Please try again.")
    except httpx.HTTPStatusError as exc:
        log.error("n8n webhook returned %s: %s", exc.response.status_code, exc.response.text)
        raise HTTPException(status_code=502, detail="Chatbot service error. Please try again.")
    except Exception as exc:
        log.exception("Unexpected error calling n8n: %s", exc)
        raise HTTPException(status_code=502, detail="Could not reach chatbot service.")

    # n8n can return { "reply": "..." } or { "output": "..." } or plain text
    if isinstance(data, dict):
        reply = (
            data.get("reply")
            or data.get("output")
            or data.get("text")
            or data.get("message")
            or str(data)
        )
    elif isinstance(data, list) and data:
        first = data[0]
        reply = (
            first.get("reply") or first.get("output") or first.get("text") or str(first)
            if isinstance(first, dict) else str(first)
        )
    else:
        reply = str(data)

    return ChatMessageResponse(reply=reply, session_id=session_id)
