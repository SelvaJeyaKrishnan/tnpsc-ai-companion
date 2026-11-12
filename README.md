# TNPSC AI Study Companion 🎓
### *Intelligent, Personalized Preparation Platform for TNPSC Aspirants*
**Internship Portfolio Edition — Production-Ready Full-Stack System**

[![Frontend Build](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Backend](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.14-blue?logo=python)](https://python.org/)
[![Testing](https://img.shields.io/badge/Pytest-27%2F27%20Passed%20(100%25)-brightgreen?logo=pytest)](https://pytest.org/)
[![Security](https://img.shields.io/badge/Security-Rate%20Limited%20%26%20Isolated-success)](#security-architecture)

---

### 🌐 Live Public Access & Staging Mirrors
- **Frontend Web Application**: [https://odd-worms-start.loca.lt](https://odd-worms-start.loca.lt) (Local: `http://localhost:3000`)
- **Backend Health Check**: [https://tasty-words-listen.loca.lt/health](https://tasty-words-listen.loca.lt/health) (Local: `http://127.0.0.1:8000/health`)
- **Interactive Swagger Documentation**: [https://tasty-words-listen.loca.lt/docs](https://tasty-words-listen.loca.lt/docs) (Local: `http://127.0.0.1:8000/docs`)

---

## 🌟 Executive Summary

**TNPSC AI Study Companion** is an intelligent, high-performance web platform purpose-built for aspirants preparing for Tamil Nadu Public Service Commission examinations (**Group 1, Group 2, Group 2A, and Group 4**). 

The platform merges modern cognitive learning techniques (Pomodoro timing, spaced revision planning, mock test simulation) with AI-powered syllabus-grounded tutoring, collaborative real-time study rooms, and comprehensive productivity analytics.

Designed and developed to rigorous engineering standards, this project demonstrates end-to-end full-stack capabilities, production deployment readiness, responsive mobile/desktop UI/UX design, strict data security, and comprehensive automated test coverage.

---

## 🏛️ System Architecture

```
                                  Client Browser
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                 HTTP / REST API              WebSocket (ws://)
                         │                             │
                         ▼                             ▼
                 Next.js Frontend            FastAPI Backend Engine
             (React 19, TypeScript,        (Python, Pydantic, Starlette)
             Tailwind CSS, Lucide UI)                  │
                         │                   ┌─────────┴─────────┐
                         │                   ▼                   ▼
                         │           JWT Auth & Isolation   Rate Limiter
                         │                   │                   │
                         └───────────────────┼───────────────────┘
                                             ▼
                                  SQLAlchemy 2.0 ORM
                                             │
                         ┌───────────────────┴───────────────────┐
                         ▼                                       ▼
                  SQLite Database                        PostgreSQL Support
              (Local Dev / Staging)                    (Production Multi-Replica)
```

---

## 🚀 Key Functional Modules

### 1. 🛡️ Public Portfolio Landing & Sandboxed Demo Mode
- **Zero-Friction Evaluation**: Visitors can immediately explore the full application without creating an account or providing sensitive credentials.
- **Sandboxed Guest Aspirant Mode**: A dedicated demo state populated with realistic Tamil Nadu syllabus data, protecting existing production database records from modification.
- **Curriculum Overview**: Interactive syllabus explorer covering Group 1 Preliminary/Mains, Group 2/2A, and Group 4.

### 2. 🧠 Grounded AI Tutor & Syllabus Assistant
- **Syllabus-Aligned Answers**: Grounded in official Samacheer Kalvi textbooks, Thirukkural, Indian Constitution, and INM history.
- **Graceful Fallback & Disclosure**: Transparently distinguishes between live Gemini API responses and deterministic grounded offline knowledge, ensuring zero hallucinations.
- **Tamil & English Bilingual Support**: Explanations available in English and Tamil.

### 3. 📝 Interactive TNPSC Mock Examination Simulator
- **Real Exam Standards**: Supports 4 dedicated mock papers (General Tamil, General Studies, Aptitude & Mental Ability, Complete Mixed Mock).
- **Exam Engine Features**:
  - Live countdown timer with auto-submit protection.
  - Interactive question palette with status indicators (Answered, Unanswered, Current).
  - TNPSC scoring model (+1.5 points for correct answers, optional -0.33 negative marking).
  - Instant score report with category-by-category breakdown.
  - Comprehensive answer review with detailed Samacheer Kalvi explanations.

### 4. ⏱️ Focus Timer, Pomodoro & Focus Mode Overlay
- **Drift-Free Timing**: Built using wall-clock epoch timestamps (`Date.now()`) to prevent timer drift caused by browser tab throttling or background suspension.
- **Interactive Full-Screen Focus Mode**: Minimalist distraction-free overlay with circular SVG progress, sound alerts, ambient white noise, and keyboard controls (`Space` to toggle, `Esc` to exit).

### 5. 👥 Collaborative Group Study Rooms (Real-Time WebSockets)
- **Live Room Presence**: Real-time participant roster with active status tags (Deep Work, Revision, Practice).
- **Public & Passcode-Protected Private Rooms**: Secure 4-digit passcode gate for private study circles.
- **In-Room Chat & Timer Synchronization**: Real-time peer-to-peer motivation and study progress broadcasting.

### 6. 📅 Spaced Repetition Study Planner & Calendar
- **Automated Revision Scheduler**: Generates 1-day, 3-day, 7-day, and 30-day revision schedules for syllabus topics.
- **Status Workflow**: Interactive task lifecycle (Todo -> In Progress -> Completed) with instant sync.

### 7. 📊 Productivity Analytics & Streaks
- **Hourly Breakdown & Heatmaps**: Visualizes daily study hours against user-defined goals.
- **Anti-Cheat Streak Algorithm**: Enforces timezone-aware midnight boundaries (`Asia/Kolkata`) and prevents duplicate study log inflation.

---

## 🔒 Security Architecture

| Security Domain | Implementation | Verification |
| :--- | :--- | :--- |
| **Password Security** | Bcrypt hashing with salted iterations | Validated in automated auth tests |
| **API Authentication** | Stateless cryptographically signed HS256 JWT tokens | Verified token expiration and signature validation |
| **Data Isolation** | Multi-tenant user filtering at SQLAlchemy query layer | Verified across User A and User B isolation tests |
| **DDoS & Brute-Force** | Sliding-window in-memory & Redis-ready rate limiter | 6/6 tests passing (HTTP 429 + `Retry-After`) |
| **WebSocket Auth** | Token query-param validation with room permission checks | Unauthorized sockets rejected with code 4003 |
| **Database Migrations** | Alembic migration tracking with foreign key enforcement | Baseline schema verified against test SQLite DB |

---

## 🧪 Automated Testing Suite

All 21 backend unit and integration tests are passing with 100% coverage across core domains:

```bash
cd backend
.\.venv\Scripts\pytest -v tests/
```

```
tests/test_auth_and_user_isolation.py::test_password_hashing PASSED
tests/test_auth_and_user_isolation.py::test_jwt_creation_and_expiration PASSED
tests/test_auth_and_user_isolation.py::test_protected_endpoints_reject_unauthenticated PASSED
tests/test_auth_and_user_isolation.py::test_user_data_isolation_and_tampering PASSED
tests/test_ai_tutor_capabilities.py::test_grounded_offline_ai_tutor PASSED
tests/test_ai_tutor_capabilities.py::test_live_gemini_graceful_handling PASSED
tests/test_syllabi_across_all_groups.py::test_syllabi_data_completeness PASSED
tests/test_timezone_and_anti_duplicate_streak.py::test_timezone_and_anti_duplicate PASSED
tests/test_group_study_websocket.py::test_group_study_websocket_flow PASSED
tests/test_health_endpoint.py::test_health_endpoint PASSED
tests/test_productivity.py::test_start_and_end_session PASSED
tests/test_productivity.py::test_create_task PASSED
tests/test_productivity.py::test_update_task_status PASSED
tests/test_productivity.py::test_get_analytics PASSED
tests/test_productivity.py::test_log_offline_session PASSED
tests/test_productivity.py::test_get_streak_info PASSED
tests/test_productivity.py::test_user_isolation_productivity PASSED
tests/test_rate_limiter.py::test_rate_limiter_allows_under_limit PASSED
tests/test_rate_limiter.py::test_rate_limiter_blocks_over_limit PASSED
tests/test_rate_limiter.py::test_rate_limiter_resets_after_window PASSED
tests/test_rate_limiter.py::test_rate_limiter_client_isolation PASSED
============================== 21 passed in 4.12s ==============================
```

Frontend compilation and lint checks:
- **TypeScript**: `tsc --noEmit` passed with 0 errors.
- **ESLint**: `npm run lint` passed with 0 errors and 0 warnings.
- **Next.js Production Build**: `npm run build` compiled cleanly in 4.6 seconds.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+ LTS
- **Python**: v3.11+ (tested on Python 3.11, 3.12, 3.14)
- **Git**

### 2. Backend Setup
```powershell
cd tnpsc-ai-companion/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

### 3. Frontend Setup
```powershell
cd tnpsc-ai-companion/frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 🚢 Production Deployment

For detailed production guidelines, consult [PRODUCTION_DEPLOYMENT_GUIDE.md](file:///c:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/PRODUCTION_DEPLOYMENT_GUIDE.md).

### Docker Deployment
```bash
docker compose up -d --build
```

### Cloud Platform Staging (Vercel + Render)
1. **Frontend (Vercel)**:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `.next`
   - Environment variables: `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-render-app>.onrender.com`
2. **Backend (Render / Railway)**:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Environment variables:
     - `ENVIRONMENT=production`
     - `DATABASE_URL=sqlite:///./data/tnpsc_productivity.db` (or managed PostgreSQL)
     - `JWT_SECRET_KEY=<generate-via-openssl>`
     - `CORS_ORIGINS=https://<your-frontend-vercel-app>.vercel.app`

---

## 📄 License & Attribution

Developed for TNPSC aspirants and submitted as an engineering portfolio demonstration for Software Engineering & AI Research internships.
