"""Public + buyer property routes."""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query

import db
import auth as auth_utils

router = APIRouter(prefix="/api", tags=["properties"])


def _serialize(p: dict) -> dict:
    p.pop("_id", None)
    return p


@router.get("/properties")
async def list_properties(
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    bedrooms: Optional[int] = None,
    furnishing: Optional[str] = None,
    sort_by: str = "newest",
    page: int = 1,
    limit: int = 12,
):
    query: dict = {"status": "published"}
    if category and category != "all":
        query["category"] = category
    if city:
        query["location.city"] = {"$regex": city, "$options": "i"}
    if min_price is not None or max_price is not None:
        query["price"] = {}
        if min_price is not None:
            query["price"]["$gte"] = min_price
        if max_price is not None:
            query["price"]["$lte"] = max_price
    if bedrooms is not None:
        query["bedrooms"] = bedrooms
    if furnishing:
        query["furnishing"] = furnishing

    sort_map = {
        "newest": [("created_at", -1)],
        "price_asc": [("price", 1)],
        "price_desc": [("price", -1)],
        "popular": [("views", -1)],
    }
    sort = sort_map.get(sort_by, sort_map["newest"])

    skip = max(0, (page - 1) * limit)
    cursor = db.properties().find(query, {"_id": 0}).sort(sort).skip(skip).limit(limit)
    items = await cursor.to_list(length=limit)
    total = await db.properties().count_documents(query)
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/properties/featured")
async def featured():
    items = (
        await db.properties()
        .find({"status": "published", "is_featured": True}, {"_id": 0})
        .sort([("created_at", -1)])
        .limit(6)
        .to_list(length=6)
    )
    if not items:
        items = (
            await db.properties()
            .find({"status": "published"}, {"_id": 0})
            .sort([("created_at", -1)])
            .limit(6)
            .to_list(length=6)
        )
    return items


@router.get("/properties/{pid}")
async def property_detail(pid: str):
    p = await db.properties().find_one({"id": pid, "status": "published"}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Property not found")
    await db.properties().update_one({"id": pid}, {"$inc": {"views": 1}})
    return p


@router.post("/users/me/saved/{pid}")
async def save_property(
    pid: str, user: dict = Depends(auth_utils.get_current_user)
):
    await db.users().update_one(
        {"id": user["id"]}, {"$addToSet": {"saved_properties": pid}}
    )
    return {"ok": True}


@router.delete("/users/me/saved/{pid}")
async def unsave_property(
    pid: str, user: dict = Depends(auth_utils.get_current_user)
):
    await db.users().update_one(
        {"id": user["id"]}, {"$pull": {"saved_properties": pid}}
    )
    return {"ok": True}


@router.get("/users/me/saved")
async def list_saved(user: dict = Depends(auth_utils.get_current_user)):
    ids = user.get("saved_properties", []) or []
    if not ids:
        return []
    items = await db.properties().find(
        {"id": {"$in": ids}, "status": "published"}, {"_id": 0}
    ).to_list(length=200)
    return items
