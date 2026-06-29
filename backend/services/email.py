"""Email service — Resend (if RESEND_API_KEY set), else log-only."""
from __future__ import annotations

import logging
import os
from typing import Optional

import httpx

log = logging.getLogger("visitsarva.email")


async def send_email(
    to: str,
    subject: str,
    html: str,
    text: Optional[str] = None,
) -> bool:
    """Send an email. Returns True if dispatched, False if logged-only or failed."""
    api_key = os.environ.get("RESEND_API_KEY")
    sender = os.environ.get("EMAIL_FROM", "VisitSarva <noreply@visitsarva.in>")
    if not api_key:
        log.info("[email:log-only] to=%s subject=%s", to, subject)
        return False
    try:
        async with httpx.AsyncClient(timeout=10.0) as cl:
            r = await cl.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": sender,
                    "to": [to],
                    "subject": subject,
                    "html": html,
                    "text": text or "",
                },
            )
            if r.status_code >= 400:
                log.warning("Resend error %s: %s", r.status_code, r.text)
                return False
            return True
    except Exception as e:
        log.warning("Email send failed: %s", e)
        return False


# --- Templates ---
def tpl_welcome(name: str, role: str) -> tuple[str, str]:
    subject = "Welcome to VisitSarva"
    html = f"""
    <div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#1a1f2e'>
      <h2 style='color:#0F2340;font-weight:600'>Welcome to VisitSarva, {name}!</h2>
      <p>You're now signed up as a <strong>{role}</strong>. Zero brokerage. Always.</p>
      <p style='margin-top:24px'><a href='{os.environ.get("CLIENT_URL","")}'
         style='background:#0D7A6B;color:#fff;padding:10px 22px;text-decoration:none;border-radius:6px'>Start exploring</a></p>
      <p style='font-size:12px;color:#5b6371;margin-top:32px'>VisitSarva — Buy property, pay no brokerage.</p>
    </div>
    """
    return subject, html


def tpl_listing_status(title: str, status: str, reason: str = "") -> tuple[str, str]:
    head = "Your listing is live!" if status == "published" else "Update on your listing"
    body = (
        f"Great news — <strong>{title}</strong> has been verified by our team and is now live on VisitSarva."
        if status == "published"
        else f"Your listing <strong>{title}</strong> needs revisions. Reason: <em>{reason}</em>"
    )
    html = f"""
    <div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#1a1f2e'>
      <h2 style='color:#0F2340'>{head}</h2>
      <p>{body}</p>
      <p style='font-size:12px;color:#5b6371;margin-top:32px'>VisitSarva</p>
    </div>
    """
    return head, html


def tpl_new_enquiry(property_title: str, name: str, phone: str, email: str, message: str) -> tuple[str, str]:
    subject = f"New enquiry: {property_title}"
    html = f"""
    <div style='font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#1a1f2e'>
      <h2 style='color:#0F2340'>New enquiry on {property_title}</h2>
      <p><strong>{name}</strong><br/>{email}<br/>{phone}</p>
      <p style='background:#fafaf7;padding:14px;border-radius:6px'>{message or "(no message)"}</p>
    </div>
    """
    return subject, html
