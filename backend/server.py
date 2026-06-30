"""VisitSarva — main FastAPI application."""
from __future__ import annotations

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Import after env is loaded
from routers.auth_router import router as auth_router  # noqa: E402
from routers.properties_router import router as properties_router  # noqa: E402
from routers.seller_router import router as seller_router  # noqa: E402
from routers.admin_router import router as admin_router  # noqa: E402
from routers.enquiries_router import router as enquiries_router  # noqa: E402
from routers.services_router import router as services_router  # noqa: E402
from routers.ai_router import router as ai_router  # noqa: E402
from routers.cms_router import router as cms_router  # noqa: E402
from routers.chat_router import router as chat_router  # noqa: E402
from seed import ensure_seed  # noqa: E402

app = FastAPI(title="VisitSarva API")


@app.get("/api/")
async def root():
    return {"app": "VisitSarva", "tagline": "Buy property, pay no brokerage."}


app.include_router(auth_router)
app.include_router(properties_router)
app.include_router(seller_router)
app.include_router(admin_router)
app.include_router(enquiries_router)
app.include_router(services_router)
app.include_router(ai_router)
app.include_router(cms_router)
app.include_router(chat_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
log = logging.getLogger("visitsarva")


@app.on_event("startup")
async def on_start():
    try:
        await ensure_seed()
        log.info("Seed complete.")
    except Exception as e:
        log.exception("Seed failed: %s", e)
