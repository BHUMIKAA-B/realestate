"""Chat router — proxies messages to the configured n8n webhook."""
from __future__ import annotations

import logging
import os
import uuid
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import get_current_user_optional

log = logging.getLogger("visitsarva")
router = APIRouter(prefix="/api/chat", tags=["chat"])

N8N_WEBHOOK_URL = os.environ.get("N8N_WEBHOOK_URL", "")


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, strip_whitespace=True)
    session_id: Optional[str] = Field(None, max_length=64)


class ChatMessageResponse(BaseModel):
    reply: str
    session_id: str


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    body: ChatMessageRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional),
):
    """Forward a user message to n8n and return the reply.

    User context is derived server-side from the verified JWT token —
    the client cannot supply or spoof identity fields.
    """
    if not N8N_WEBHOOK_URL:
        raise HTTPException(
            status_code=503,
            detail="Chatbot is not configured yet. Set the N8N_WEBHOOK_URL environment variable.",
        )

    session_id = body.session_id or str(uuid.uuid4())

    # Build user context from server-verified token only
    user_context = None
    if current_user:
        user_context = {
            "id": str(current_user.get("id") or current_user.get("_id") or ""),
            "email": current_user.get("email"),
            "full_name": current_user.get("full_name"),
            "role": current_user.get("role"),
        }

    payload = {
        "message": body.message,
        "session_id": session_id,
        "user": user_context,
        "source": "visitsarva-web",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(N8N_WEBHOOK_URL, json=payload)
            resp.raise_for_status()
    except httpx.TimeoutException:
        log.error("n8n webhook timed out")
        raise HTTPException(status_code=504, detail="Chatbot service timed out. Please try again.")
    except httpx.HTTPStatusError as exc:
        log.error("n8n webhook returned %s: %s", exc.response.status_code, exc.response.text)
        raise HTTPException(status_code=502, detail="Chatbot service error. Please try again.")
    except Exception as exc:
        log.exception("Unexpected error calling n8n: %s", exc)
        raise HTTPException(status_code=502, detail="Could not reach chatbot service.")

    # Parse reply — n8n may return JSON or plain text
    reply = _extract_reply(resp)

    return ChatMessageResponse(reply=reply, session_id=session_id)


def _extract_reply(resp: httpx.Response) -> str:
    """Extract the reply string from whatever n8n returns."""
    # Try JSON first
    try:
        data = resp.json()
    except Exception:
        # Not JSON — treat raw text as the reply
        return resp.text.strip() or "I received your message but couldn't parse a reply."

    if isinstance(data, dict):
        return (
            data.get("reply")
            or data.get("output")
            or data.get("text")
            or data.get("message")
            or str(data)
        )
    if isinstance(data, list) and data:
        first = data[0]
        if isinstance(first, dict):
            return (
                first.get("reply")
                or first.get("output")
                or first.get("text")
                or str(first)
            )
        return str(first)
    return str(data)
