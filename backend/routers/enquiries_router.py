"""Enquiries (buyer → property owner / VisitSarva team)."""
from fastapi import APIRouter, Depends, HTTPException
import db
import auth as auth_utils
from models import EnquiryCreate, new_id, now_iso
from routers.cms_router import push_notification
from services.email import send_email, tpl_new_enquiry, tpl_welcome

router = APIRouter(prefix="/api", tags=["enquiries"])


@router.post("/enquiries")
async def create_enquiry(
    payload: EnquiryCreate,
    user: dict | None = Depends(auth_utils.get_current_user_optional),
):
    prop = await db.properties().find_one(
        {"id": payload.property_id, "status": "published"}, {"_id": 0}
    )
    if not prop:
        raise HTTPException(status_code=404, detail="Property not available")
    doc = {
        "id": new_id(),
        "property_id": payload.property_id,
        "property_title": prop.get("title"),
        "buyer_id": user["id"] if user else None,
        "name": payload.name.strip(),
        "email": payload.email.lower(),
        "phone": payload.phone.strip(),
        "message": payload.message,
        "contact_preference": payload.contact_preference,
        "status": "new",
        "created_at": now_iso(),
    }
    await db.enquiries().insert_one(doc)
    await db.properties().update_one(
        {"id": payload.property_id}, {"$inc": {"enquiries": 1}}
    )
    # Notify seller
    seller_id = prop.get("listed_by")
    if seller_id:
        await push_notification(
            seller_id,
            "New enquiry",
            f'{payload.name} enquired about {prop.get("title")}',
            "/seller/enquiries",
        )
        seller = await db.users().find_one({"id": seller_id}, {"_id": 0})
        if seller:
            subject, html = tpl_new_enquiry(
                prop.get("title", ""), payload.name, payload.phone, payload.email, payload.message
            )
            await send_email(seller["email"], subject, html)
    doc.pop("_id", None)
    return doc


@router.get("/enquiries/me")
async def my_enquiries(user: dict = Depends(auth_utils.get_current_user)):
    items = (
        await db.enquiries()
        .find({"buyer_id": user["id"]}, {"_id": 0})
        .sort([("created_at", -1)])
        .to_list(length=200)
    )
    return items
