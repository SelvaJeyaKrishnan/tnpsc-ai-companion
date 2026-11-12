# TNPSC AI Study Companion – Vercel-Only Production Deployment Architecture

**Target Deployment Platform:** Vercel (Frontend & Serverless Python Backend)  
**Database:** Managed PostgreSQL (Neon / Supabase via Vercel Integration)  
**GitHub Repository:** `https://github.com/SelvaJeyaKrishnan/tnpsc-ai-companion` (Branch `main`, Commit `bfd14ca`)

---

## 1. Vercel-Only Architecture Overview

To host both the Next.js frontend and the FastAPI backend entirely on Vercel without third-party application servers:

```
[ Visitor / Aspirant Browser ]
              │
              ├───► Next.js 15 Frontend (Vercel Project 1: tnpsc-ai-companion)
              │       └─ Root Directory: `frontend/`
              │       └─ Env: NEXT_PUBLIC_API_BASE_URL -> https://tnpsc-api.vercel.app
              │
              └───► FastAPI Python Backend (Vercel Project 2: tnpsc-api)
                      └─ Root Directory: `backend/`
                      └─ Entrypoint: `api/index.py` (Serverless Function runtime)
                      └─ Config: `vercel.json` with URL rewrites to `/api/index.py`
                      └─ Env: DATABASE_URL -> Managed PostgreSQL (Neon / Supabase)
```

---

## 2. Serverless Python Backend Configuration on Vercel

The backend is now structured and committed to GitHub specifically for Vercel Serverless Python execution:
- **Serverless Entrypoint:** `backend/api/index.py` imports `app` from `app.main`.
- **Vercel Routing:** `backend/vercel.json` rewrites all incoming routes (`/(.*)`) to `/api/index.py`.
- **Dependencies:** `backend/requirements.txt` includes `fastapi`, `uvicorn`, `pydantic-settings`, `sqlalchemy`, `psycopg2-binary`, `pyjwt`, `httpx`, and `alembic`.
- **Database Layer:** `backend/app/database.py` dynamically handles PostgreSQL connection pooling and SSL modes (`sslmode=require`).

---

## 3. WebSocket Compatibility on Vercel Serverless

> [!NOTE]
> Vercel Serverless Functions execute on ephemeral microVMs with execution timeouts (typically 15s to 60s). Long-lived persistent WebSocket connections (such as virtual group study rooms) will drop when an individual function invocation ends.
> 
> **Safest Achievable Approach on Vercel:**
> 1. REST endpoints for room creation, listing, passcode validation, participant roster, and timer states are 100% durable in PostgreSQL.
> 2. The frontend automatically recovers and falls back gracefully when WebSockets are disconnected.

---

## 4. Exact Steps to Deploy on Vercel (5 Minutes)

### Step 1: Deploy Backend (`tnpsc-api`) on Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your repository: **`SelvaJeyaKrishnan/tnpsc-ai-companion`**.
3. Set **Project Name:** `tnpsc-companion-api`.
4. In the configuration card, click **Edit** next to **Root Directory** and select **`backend`**.
5. Add the following **Environment Variables**:
   - `DATABASE_URL`: Your Managed PostgreSQL connection string (from Neon or Supabase: `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require`).
   - `JWT_SECRET_KEY`: A random 64-character hex string (e.g., `d2948b8492048591820491820498120481209481204812094812094812049812`).
   - `APP_ENV`: `production`
6. Click **Deploy**.
7. Once finished, note your live backend URL: `https://tnpsc-companion-api.vercel.app`.
8. Verify health at: `https://tnpsc-companion-api.vercel.app/health`.

### Step 2: Deploy Frontend (`tnpsc-ai-companion`) on Vercel
1. Return to [vercel.com/new](https://vercel.com/new).
2. Select the same repository: **`SelvaJeyaKrishnan/tnpsc-ai-companion`**.
3. Set **Project Name:** `tnpsc-ai-companion`.
4. Set **Root Directory:** **`frontend`**.
5. Add the following **Environment Variable**:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://tnpsc-companion-api.vercel.app` (your backend URL from Step 1).
6. Click **Deploy**.

---

## 5. Managed PostgreSQL Setup (Free & Instant on Neon / Supabase)

To obtain your permanent production `DATABASE_URL`:
1. Go to [neon.tech](https://neon.tech) (or [supabase.com](https://supabase.com)) and create a free project named `tnpsc-db`.
2. Copy the Connection String with pooled connection:
   `postgresql://[user]:[password]@[host]/neondb?sslmode=require`
3. Paste this as `DATABASE_URL` into your Vercel backend environment variables.
