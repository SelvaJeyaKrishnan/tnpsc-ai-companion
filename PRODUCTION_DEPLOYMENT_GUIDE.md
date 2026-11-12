# TNPSC AI Study Companion – Production Deployment Guide (v1.2)

This guide provides instructions for deploying the **TNPSC AI Study Companion** to a hardened production or staging environment.

---

## 1. Architecture Overview

```
                      Internet
                         │
                         ▼
             ┌───────────────────────┐
             │   Reverse Proxy / SSL │ (Nginx / Caddy / Cloudflare)
             │   (Port 80 / 443)     │
             └───────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌──────────────────┐           ┌──────────────────┐
│ Next.js Frontend │           │ FastAPI Backend  │
│ (Port 3000)      │           │ (Port 8000)      │
└──────────────────┘           └─────────┬────────┘
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
               ┌──────────────────┐            ┌──────────────────┐
               │ SQLite Database  │     OR     │ PostgreSQL DB    │
               │ (Single Replica) │            │ (Multi-Replica)  │
               └──────────────────┘            └──────────────────┘
```

---

## 2. Prerequisites

- **Host Operating System**: Linux (Ubuntu 22.04 LTS / Debian 12 recommended)
- **Container Engine**: Docker 24.0+ and Docker Compose v2.20+
- **Node.js**: v20+ (if running bare metal)
- **Python**: 3.11+ or 3.12+ (if running bare metal)
- **Domain Name**: Fully qualified domain name pointing to the host server IP
- **SSL Certificate**: Let's Encrypt / Certbot or Cloudflare Origin CA

---

## 3. Containerized Deployment (Recommended)

### Step 1: Clone Repository & Create Data Directory
```bash
git clone <repository-url> /opt/tnpsc-companion
cd /opt/tnpsc-companion
mkdir -p backend/data
chmod 775 backend/data
```

### Step 2: Configure Production Environment Variables
Copy and customize the sanitized production templates:

```bash
# Backend Environment
cp backend/.env.production.example backend/.env

# Frontend Environment
cp frontend/.env.production.example frontend/.env.local
```

Generate a secure 64-byte cryptographic key for JWT encryption:
```bash
openssl rand -hex 64
```
Paste this value into `backend/.env` under `JWT_SECRET_KEY`.

### Step 3: Launch with Docker Compose
```bash
docker compose up -d --build
```

Verify service health:
```bash
docker compose ps
curl -f http://localhost:8000/health
curl -f http://localhost:3000/
```

---

## 4. Reverse Proxy & WebSocket Configuration (Nginx Example)

Create `/etc/nginx/sites-available/tnpsc-companion`:

```nginx
# Upstream Definitions
upstream backend_api {
    server 127.0.0.1:8000;
    keepalive 32;
}

upstream frontend_web {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 80;
    server_name study.example.com api.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name study.example.com;

    ssl_certificate /etc/letsencrypt/live/study.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/study.example.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend Routing
    location / {
        proxy_pass http://frontend_web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API Routing
    location /api/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket Study Rooms Routing
    location /api/rooms/ {
        proxy_pass http://backend_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }
}
```

Enable the site and reload Nginx:
```bash
ln -s /etc/nginx/sites-available/tnpsc-companion /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## 5. Scaling & Process Management

- **Single Instance (SQLite)**: Run 1 replica with Uvicorn / Docker Compose. The in-memory rate limiter and SQLite database operate safely.
- **Multi-Instance (PostgreSQL)**: If horizontal autoscaling is enabled across multiple containers:
  1. Set `DATABASE_URL=postgresql://user:pass@pg-host:5432/tnpsc_prod`.
  2. Set `TRUST_PROXY_HEADERS=true` in `backend/.env`.
  3. Replace `InMemoryRateLimiter` with a Redis backend for synchronized rate limiting across worker nodes.

---

## 6. Verification Checklist

- [ ] Backend health: `GET /health` returns `{"status":"ok"}`.
- [ ] Database migrations: `alembic current` matches `alembic heads`.
- [ ] WebSocket connection: Can connect to `/api/rooms/{code}/ws` with Bearer token.
- [ ] Authentication: Registration and login issue valid JWTs.
- [ ] Protected endpoints: Unauthenticated calls to `/api/auth/me` return 401.
- [ ] Rate limits: Sensitive endpoints return 429 when throttled.
