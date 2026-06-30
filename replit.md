# VisitSarva

A full-stack real estate platform where buyers browse and enquire on properties with zero brokerage, sellers list and manage their inventory, and admins oversee the platform. Includes an AI-powered property search and a chat assistant.

## Stack

- **Frontend**: React 18 (CRA + CRACO), Tailwind CSS, Radix UI, React Router v7, Zustand, TanStack Query — runs on port 5000
- **Backend**: FastAPI + Motor (async MongoDB driver), JWT auth, Uvicorn — runs on port 8000
- **Database**: MongoDB (async via Motor)

## Running locally on Replit

Two workflows must be running simultaneously:

| Workflow | Command | Port |
|----------|---------|------|
| Backend API | `cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload` | 8000 |
| Start application | `cd frontend && PORT=5000 yarn start` | 5000 (preview) |

The frontend dev server proxies all `/api/*` requests to the backend on `localhost:8000` (configured in `frontend/craco.config.js`).

## Required Secrets

| Secret | Purpose |
|--------|---------|
| `MONGO_URL` | MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/visitsarva`) |
| `JWT_SECRET` | Secret key for signing JWT access/refresh tokens |

## Optional Secrets / Env Vars

| Key | Purpose |
|-----|---------|
| `EMERGENT_LLM_KEY` | AI-powered property search and chat |
| `RESEND_API_KEY` | Transactional email (enquiry notifications) |
| `N8N_WEBHOOK_URL` | n8n chat webhook (already set) |
| `REACT_APP_BACKEND_URL` | Backend URL for the frontend (set to `""` to use the proxy) |

## Project Structure

```
backend/
  server.py         # FastAPI app entry point
  db.py             # MongoDB connection (Motor)
  auth.py           # JWT helpers
  models.py         # Pydantic models
  seed.py           # Seeds admin user and sample data on startup
  routers/          # auth, properties, seller, admin, enquiries, services, ai, cms, chat
  services/         # email.py

frontend/
  src/
    App.js          # Routes (buyer, seller, admin roles)
    api/client.js   # Axios instance with JWT interceptor
    pages/          # Landing, Login, Register, Properties, Seller, Admin, Chat...
    components/     # Shared UI components
    store/          # Zustand stores (auth, etc.)
```

## User Preferences

_No preferences recorded yet._
