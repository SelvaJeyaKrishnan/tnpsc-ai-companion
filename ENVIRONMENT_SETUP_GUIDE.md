# TNPSC AI Study Companion – Environment Setup Guide (v1.2)

This document details all required and optional environment variables across the backend and frontend services.

---

## 1. Backend Environment Variables (`backend/.env`)

| Variable Name | Required | Default Value | Description & Security Guidelines |
| :--- | :---: | :--- | :--- |
| `APP_ENV` | Yes | `production` | Environment mode (`development`, `staging`, `production`). In production, debug endpoints and hot-reload are disabled. |
| `PORT` | No | `8000` | Port on which FastAPI / Uvicorn binds. |
| `HOST` | No | `0.0.0.0` | Host IP binding address for container routing. |
| `CORS_ORIGINS` | Yes | `["https://study.example.com"]` | JSON array or comma-separated list of allowed origins. Never set to `*` when credentials are used. |
| `JWT_SECRET_KEY` | Yes | *Must generate* | 64-byte hex key for HMAC-SHA256 signature validation. Generate via `openssl rand -hex 64`. |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `10080` | Token expiration duration in minutes (default is 7 days). |
| `DATABASE_URL` | No | `sqlite:///./data/tnpsc_productivity.db` | SQLAlchemy database connection URI. If pointing to PostgreSQL: `postgresql://user:password@host:5432/dbname`. |
| `GEMINI_API_KEY` | Optional | `""` | Google Gemini API key for live AI Tutor concept clarification. If omitted, system falls back to offline Samacheer syllabus engine. |
| `TRUST_PROXY_HEADERS` | No | `false` | Set to `true` ONLY if running behind a trusted reverse proxy (Nginx, Traefik, Cloudflare) that strips untrusted `X-Forwarded-For` headers. |
| `RATE_LIMIT_LOGIN_MAX` | No | `20` | Max login attempts allowed per window per IP. |
| `RATE_LIMIT_LOGIN_WINDOW` | No | `60` | Login rate limit sliding window in seconds. |
| `RATE_LIMIT_REGISTER_MAX` | No | `10` | Max user registrations allowed per window per IP. |
| `RATE_LIMIT_REGISTER_WINDOW`| No | `60` | Registration rate limit sliding window in seconds. |
| `RATE_LIMIT_AI_MAX` | No | `30` | Max AI Tutor inquiries allowed per window per user. |
| `RATE_LIMIT_AI_WINDOW` | No | `60` | AI Tutor rate limit sliding window in seconds. |
| `RATE_LIMIT_ROOM_MAX` | No | `15` | Max study room creation requests allowed per window. |
| `RATE_LIMIT_ROOM_WINDOW` | No | `60` | Study room rate limit sliding window in seconds. |

---

## 2. Frontend Environment Variables (`frontend/.env.local`)

| Variable Name | Required | Example Value | Description |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | `https://api.example.com` | Base URL of the FastAPI backend. Used by client browser fetch calls and WebSockets. |
| `NEXT_PUBLIC_APP_ENV` | No | `production` | Frontend operational mode indicator. |

---

## 3. Cryptographic Key Generation

To generate a production-grade secret key for JWT authentication, run:

```bash
# On Linux / macOS / WSL
openssl rand -hex 64

# On Windows PowerShell
[BitConverter]::ToString((New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes((New-Object byte[] 64))).Replace("-","").ToLower()
```

---

## 4. Security Rules & Safe Practices

1. **Never commit `.env` or `.env.local` files**: Both are excluded in `.gitignore`.
2. **Never hardcode secrets in client bundles**: Any variable starting with `NEXT_PUBLIC_` is baked into the JavaScript bundle sent to users' browsers. Do **not** prefix API keys, JWT secrets, or database URLs with `NEXT_PUBLIC_`.
3. **Restricted CORS**: Always limit `CORS_ORIGINS` to the exact public domain of the frontend web application.
