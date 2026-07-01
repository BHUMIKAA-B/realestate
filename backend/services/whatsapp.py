"""WhatsApp notification service via Twilio."""
from __future__ import annotations

import logging
import os
from typing import Optional

import httpx

log = logging.getLogger("visitsarva.whatsapp")


async def send_whatsapp(to_phone: str, message: str) -> bool:
    """Send a WhatsApp message via Twilio.

    Requires env vars:
      TWILIO_ACCOUNT_SID
      TWILIO_AUTH_TOKEN
      TWILIO_WHATSAPP_FROM  — e.g. "whatsapp:+14155238886" (Twilio sandbox number)

    Returns True if sent, False if not configured or on error.
    """
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    from_number = os.environ.get("TWILIO_WHATSAPP_FROM", "")

    if not (account_sid and auth_token and from_number):
        log.debug("Twilio not configured — skipping WhatsApp notification")
        return False

    # Normalize phone: ensure whatsapp: prefix and country code
    phone = to_phone.strip().replace(" ", "").replace("-", "")
    if not phone.startswith("+"):
        phone = "+91" + phone.lstrip("0")
    to_wa = f"whatsapp:{phone}"

    url = f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json"
    try:
        async with httpx.AsyncClient(timeout=10.0) as cl:
            r = await cl.post(
                url,
                auth=(account_sid, auth_token),
                data={"From": from_number, "To": to_wa, "Body": message},
            )
            if r.status_code >= 400:
                log.warning("Twilio error %s: %s", r.status_code, r.text)
                return False
            log.info("WhatsApp sent to %s", to_wa)
            return True
    except Exception as e:
        log.warning("WhatsApp send failed: %s", e)
        return False
