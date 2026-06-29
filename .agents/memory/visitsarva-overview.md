---
name: VisitSarva project overview
description: Key architectural decisions, env var setup, and buyer feature patterns for the VisitSarva real estate app
---

## Stack
- Frontend: React 18 / CRA via CRACO, port 5000, Tailwind + shadcn/radix UI
- Backend: FastAPI + Motor (async MongoDB), port 8000
- DB: MongoDB Atlas required — localhost:27017 does NOT work in Replit sandbox

## Env / Secrets
- `MONGO_URL` — Replit Secret (must be a cloud Atlas URL, not localhost)
- `SESSION_SECRET` — Replit Secret
- `REACT_APP_BACKEND_URL` — set to empty string `""` so API_BASE resolves to `/api` (relative)
- `"proxy": "http://localhost:8000"` in `frontend/package.json` forwards all /api/* to backend

**Why:** Replit has no local MongoDB process; user initially entered localhost URL causing 500s. Proxy pattern avoids CORS issues in the preview iframe.

## Replit preview setup (critical)
- Port mapping in `.replit`: `localPort = 5000` must map to `externalPort = 80` so the preview pane shows the frontend
- CRA devServer must have `allowedHosts: 'all'` in `craco.config.js` devServer config — otherwise `.replit.dev` domain gets "Invalid Host header" rejection
- react-leaflet must be pinned to v4.2.1 — v5 breaks with CRA/React 18 ("render is not a function" context error)

**Why:** Replit preview iframe uses the `.replit.dev` hostname; CRA's webpack-dev-server rejects unknown hosts by default.

## Brand tokens (index.css)
- `--vs-teal: #0D7A6B` (primary action)
- `--vs-navy: #0F2340` (headings/emphasis)
- `--vs-gold: #c89b5f` (accent)
- CSS classes: `btn-primary`, `btn-outline`, `chip`, `chip-active`, `card`, `input-field`, `label`

## Verified property pattern
- Backend: `is_featured: True` marks a property as verified
- Frontend PropertyCard shows "Verified" badge when `property.is_featured === true`
- Filter: `?verified_only=1` → backend adds `query["is_featured"] = True`

## Map view pattern
- `PropertyMapView` uses react-leaflet v4.2.1 (pinned); green marker = verified, blue = standard
- URL param `?view=map` initializes PropertiesList in map mode (lazy-reads from params on mount)
- Properties without lat/lng are excluded from map display but counted

## EMI Calculator accessibility pattern
- `role="dialog"`, `aria-modal`, `aria-labelledby` on dialog div
- Focus trapped inside modal, auto-focuses close button on open
- Esc key closes via `document.addEventListener("keydown")`
- `aria-live="polite"` on result values for screen reader updates
- Inputs have explicit `htmlFor`/`id` pairs; range inputs have `aria-label`
