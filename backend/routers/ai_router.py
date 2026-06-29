"""AI routes — Claude listing assistant + buyer smart search."""
from __future__ import annotations

import json
import os
import re
from fastapi import APIRouter, HTTPException

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ModuleNotFoundError:
    LlmChat = None
    UserMessage = None

import db
from models import (
    ListingAssistantRequest,
    ListingAssistantResponse,
    SmartSearchRequest,
    SmartSearchResponse,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])

MODEL_PROVIDER = "anthropic"
MODEL_NAME = "claude-4-sonnet-20250514"


def _llm_key() -> str:
    if LlmChat is None or UserMessage is None:
        raise HTTPException(
            status_code=500,
            detail="Emergent AI package is not installed; AI routes are unavailable locally",
        )
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
    return key


def _extract_json(text: str) -> dict:
    """Best-effort extraction of the last JSON object in the assistant reply."""
    if not text:
        return {}
    # ```json ... ``` fenced block
    m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    # Greedy: last balanced { ... } in the string
    candidates = re.findall(r"\{(?:[^{}]|(?:\{[^{}]*\}))*\}", text, re.DOTALL)
    for cand in reversed(candidates):
        try:
            return json.loads(cand)
        except Exception:
            continue
    return {}


def _strip_json_block(text: str) -> str:
    text = re.sub(r"```json.*?```", "", text, flags=re.DOTALL)
    return text.strip()


LISTING_SYSTEM = """You are VisitSarva's property listing assistant. \
You help sellers describe their property and prepare a high-quality listing.

Be friendly, concise, and ask one or two focused follow-up questions per turn \
(only what is still missing). Never invent details the seller has not given.

After your conversational reply, ALWAYS append a single JSON block in this exact format:

```json
{
  "title": "",
  "category": "",
  "sub_category": "",
  "description": "",
  "price": 0,
  "price_negotiable": false,
  "bedrooms": 0,
  "bathrooms": 0,
  "floors": 0,
  "facing": "",
  "furnishing": "",
  "amenities": [],
  "features": [],
  "location": { "address": "", "city": "", "state": "", "pincode": "" },
  "area": { "size": 0, "unit": "sqft" }
}
```

Rules:
- `category` MUST be one of: commercial, residential, plot, agriculture, apartment, rental, industrial, construction_interior.
- `area.unit` MUST be one of: sqft, sqm, acre, cent, guntha.
- Only fill fields you have confirmed information for. Leave the rest as empty string, 0, [], or {}.
- Numbers as numbers (not strings). Booleans as true/false.
- IMPORTANT — `title`: As soon as you know at least two of {category, bedrooms, locality, city, sub_category}, you MUST produce a non-empty draft `title` (e.g., "3 BHK Apartment in Whitefield, Bangalore" or "Commercial Office in HITEC City, Hyderabad"). Improve it on subsequent turns as you learn more. Never leave `title` empty if you can infer ANY reasonable title from the conversation so far.
- IMPORTANT — `description`: As soon as you have 2-3 facts about the property, produce a 1-2 sentence draft description. The seller can edit later. Never leave `description` empty if any details have been shared.
- Re-emit ALL fields you have confirmed in EVERY turn (not just the new ones). Carry forward known values from the prior conversation.
"""


SEARCH_SYSTEM = """You are VisitSarva's property search assistant. \
The user describes what they are looking for in natural language (in English, Hindi, \
or Indian English). Convert it into structured filters and a friendly summary.

Return ONLY a single JSON block with this exact shape (no prose before or after):

```json
{
  "summary": "One sentence describing what we understood.",
  "filters": {
    "category": "",
    "city": "",
    "min_price": null,
    "max_price": null,
    "bedrooms": null,
    "furnishing": ""
  }
}
```

Rules:
- `category` must be one of: commercial, residential, plot, agriculture, apartment, rental, industrial, construction_interior — or "" if unclear.
- Prices in INR (integer rupees). Convert: 1 lakh = 100000, 1 crore = 10000000.
- Leave a field as "" or null if not mentioned.
"""


@router.post("/listing-assistant", response_model=ListingAssistantResponse)
async def listing_assistant(body: ListingAssistantRequest):
    chat = LlmChat(
        api_key=_llm_key(),
        session_id=body.session_id,
        system_message=LISTING_SYSTEM,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)

    # Replay prior history so Claude has context (the library is stateful per
    # session_id, but for safety we feed prior turns as a single primer).
    if body.history:
        primer_lines = ["Prior conversation:"]
        for h in body.history[-10:]:
            primer_lines.append(f"- {h.role.upper()}: {h.content}")
        primer_lines.append(f"USER (now): {body.message}")
        user_text = "\n".join(primer_lines)
    else:
        user_text = body.message

    try:
        reply = await chat.send_message(UserMessage(text=user_text))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    extracted = _extract_json(reply)
    reply_clean = _strip_json_block(reply) or "Got it — anything else to add?"
    return ListingAssistantResponse(reply=reply_clean, extracted=extracted)


@router.post("/smart-search", response_model=SmartSearchResponse)
async def smart_search(body: SmartSearchRequest):
    chat = LlmChat(
        api_key=_llm_key(),
        session_id=f"search-{os.urandom(4).hex()}",
        system_message=SEARCH_SYSTEM,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)
    try:
        reply = await chat.send_message(UserMessage(text=body.query))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e}")

    parsed = _extract_json(reply) or {}
    summary = parsed.get("summary") or "Here are matches for your query."
    filters = parsed.get("filters") or {}

    mongo_q: dict = {"status": "published"}
    if filters.get("category"):
        mongo_q["category"] = filters["category"]
    if filters.get("city"):
        mongo_q["location.city"] = {"$regex": filters["city"], "$options": "i"}
    price_q: dict = {}
    if filters.get("min_price") is not None:
        price_q["$gte"] = float(filters["min_price"])
    if filters.get("max_price") is not None:
        price_q["$lte"] = float(filters["max_price"])
    if price_q:
        mongo_q["price"] = price_q
    if filters.get("bedrooms"):
        try:
            mongo_q["bedrooms"] = int(filters["bedrooms"])
        except Exception:
            pass
    if filters.get("furnishing"):
        mongo_q["furnishing"] = filters["furnishing"]

    results = (
        await db.properties()
        .find(mongo_q, {"_id": 0})
        .sort([("created_at", -1)])
        .limit(24)
        .to_list(length=24)
    )
    return SmartSearchResponse(
        summary=summary,
        filters=filters,
        results=results,
        count=len(results),
    )
