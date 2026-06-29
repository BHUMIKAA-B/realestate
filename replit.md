# VisitSarva — Real Estate Platform

Zero-brokerage property marketplace with buyer, seller, and admin portals.

## Architecture

- **Frontend**: React 18 + CRA (CRACO) — runs on port 5000 (`cd frontend && PORT=5000 yarn start`)
- **Backend**: FastAPI + Motor (async MongoDB) — runs on port 8000 (`cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload`)
- **Database**: MongoDB (Motor/PyMongo async driver). Requires `MONGO_URL` secret (cloud/Atlas URL — localhost won't work in Replit).

## Workflows

- **Start application** — Frontend on port 5000 (webview)
- **Backend API** — FastAPI on port 8000 (console)

## Environment Variables / Secrets

| Key | Type | Notes |
|---|---|---|
| `MONGO_URL` | Secret | MongoDB Atlas connection string |
| `SESSION_SECRET` | Secret | JWT signing secret |
| `REACT_APP_BACKEND_URL` | Env var | Empty string (proxy handles routing) |

Frontend proxies `/api/*` requests to `localhost:8000` via `"proxy"` in `frontend/package.json`.

## Key Pages

| Route | Component | Auth |
|---|---|---|
| `/` | Landing | Public |
| `/properties` | PropertiesList | Public |
| `/properties/:id` | PropertyDetail | Public |
| `/home` | BuyerHome | Buyer / Admin |
| `/saved` | SavedProperties | Buyer / Admin |
| `/seller/dashboard` | SellerDashboard | Seller / Admin |
| `/admin/dashboard` | AdminDashboard | Admin |

## Buyer Features (implemented)

- **Verified Properties filter** — sidebar toggle on `/properties`, backend `?verified_only=1` filters `is_featured=True`
- **Map View** — List/Map toggle on `/properties`, `PropertyMapView` uses react-leaflet with color-coded markers (green=verified, blue=standard)
- **EMI Calculator** — accessible modal (`role="dialog"`, focus trap, Esc-to-close) with loan amount, interest rate, tenure sliders; accessible from BuyerHome tools section and the properties page
- **Buyer Tools section** — BuyerHome shows 4 tool cards: Verified Properties, Map View, EMI Calculator, Document Services

## User Preferences

- Follow existing brand tokens: `--vs-teal: #0D7A6B`, `--vs-navy: #0F2340`, `--vs-bg: #fafaf7`
- Use Tailwind utility classes + custom CSS classes (`btn-primary`, `btn-outline`, `chip`, `card`, `input-field`, `label`)
- Keep filter components in `frontend/src/components/`, pages in `frontend/src/pages/`
