"""Admin routes: verification, user management, stats."""
from fastapi import APIRouter, Depends, HTTPException

import db
import auth as auth_utils
from models import VerifyDecision, RejectDecision, now_iso

from routers.cms_router import push_notification
from services.email import send_email, tpl_listing_status, tpl_new_enquiry
import os

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _admin(user: dict = Depends(auth_utils.require_roles("admin"))):
    return user


@router.get("/dashboard/stats")
async def stats(_: dict = Depends(_admin)):
    pending = await db.properties().count_documents({"status": "pending_verification"})
    published = await db.properties().count_documents({"status": "published"})
    rejected = await db.properties().count_documents({"status": "rejected"})
    users_total = await db.users().count_documents({})
    buyers = await db.users().count_documents({"role": "buyer"})
    sellers = await db.users().count_documents({"role": "seller"})
    enquiries_count = await db.enquiries().count_documents({})
    services_count = await db.service_requests().count_documents({})
    return {
        "pending_listings": pending,
        "published_listings": published,
        "rejected_listings": rejected,
        "users_total": users_total,
        "buyers": buyers,
        "sellers": sellers,
        "enquiries": enquiries_count,
        "service_requests": services_count,
    }


@router.get("/properties/pending")
async def pending_queue(_: dict = Depends(_admin)):
    items = (
        await db.properties()
        .find({"status": "pending_verification"}, {"_id": 0})
        .sort([("created_at", 1)])
        .to_list(length=500)
    )
    return items


@router.get("/properties")
async def all_properties(_: dict = Depends(_admin), status: str | None = None):
    q = {}
    if status:
        q["status"] = status
    items = (
        await db.properties()
        .find(q, {"_id": 0})
        .sort([("created_at", -1)])
        .to_list(length=1000)
    )
    return items


@router.put("/properties/{pid}/verify")
async def verify_property(
    pid: str, payload: VerifyDecision, admin: dict = Depends(_admin)
):
    res = await db.properties().update_one(
        {"id": pid},
        {
            "$set": {
                "status": "published",
                "verified_by": admin["id"],
                "verification_notes": payload.notes or "",
                "rejection_reason": "",
                "updated_at": now_iso(),
            }
        },
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    prop = await db.properties().find_one({"id": pid}, {"_id": 0})
    if prop:
        seller = await db.users().find_one({"id": prop.get("listed_by")}, {"_id": 0})
        if seller:
            await push_notification(
                seller["id"], "Listing published", f'{prop["title"]} is now live.', f'/properties/{pid}'
            )
            subject, html = tpl_listing_status(prop["title"], "published")
            await send_email(seller["email"], subject, html)
    return {"ok": True, "status": "published"}


@router.put("/properties/{pid}/reject")
async def reject_property(
    pid: str, payload: RejectDecision, admin: dict = Depends(_admin)
):
    res = await db.properties().update_one(
        {"id": pid},
        {
            "$set": {
                "status": "rejected",
                "verified_by": admin["id"],
                "rejection_reason": payload.reason,
                "updated_at": now_iso(),
            }
        },
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    prop = await db.properties().find_one({"id": pid}, {"_id": 0})
    if prop:
        seller = await db.users().find_one({"id": prop.get("listed_by")}, {"_id": 0})
        if seller:
            await push_notification(
                seller["id"],
                "Listing needs revision",
                f'{prop["title"]} was not approved. Reason: {payload.reason}',
                "/seller/dashboard",
            )
            subject, html = tpl_listing_status(prop["title"], "rejected", payload.reason)
            await send_email(seller["email"], subject, html)
    return {"ok": True, "status": "rejected"}


@router.get("/users")
async def list_users(_: dict = Depends(_admin)):
    items = await db.users().find(
        {}, {"_id": 0, "password_hash": 0}
    ).sort([("created_at", -1)]).to_list(length=500)
    return items


@router.put("/users/{uid}/status")
async def toggle_user(uid: str, body: dict, _: dict = Depends(_admin)):
    is_active = bool(body.get("is_active", True))
    res = await db.users().update_one(
        {"id": uid}, {"$set": {"is_active": is_active, "updated_at": now_iso()}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"ok": True}


@router.get("/enquiries")
async def all_enquiries(_: dict = Depends(_admin)):
    items = (
        await db.enquiries()
        .find({}, {"_id": 0})
        .sort([("created_at", -1)])
        .to_list(length=1000)
    )
    return items


@router.get("/service-requests")
async def all_services(_: dict = Depends(_admin)):
    items = (
        await db.service_requests()
        .find({}, {"_id": 0})
        .sort([("created_at", -1)])
        .to_list(length=1000)
    )
    return items


@router.put("/service-requests/{sid}")
async def update_service(sid: str, body: dict, _: dict = Depends(_admin)):
    allowed = {"status", "notes"}
    upd = {k: v for k, v in body.items() if k in allowed}
    if not upd:
        raise HTTPException(status_code=400, detail="No allowed fields")
    upd["updated_at"] = now_iso()
    res = await db.service_requests().update_one({"id": sid}, {"$set": upd})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Service request not found")
    return {"ok": True}
