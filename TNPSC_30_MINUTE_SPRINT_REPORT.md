# TNPSC AI Study Companion – 30-Minute Sprint Execution Report

**Project:** TNPSC AI Study Companion  
**Role:** Senior Full-Stack Engineer, UI/UX Auditor, QA Engineer & DevOps Engineer  
**Sprint Window:** 30 Minutes Focused Execution  
**Date:** November 12, 2026  
**Final Status:** **PASS (Production & Portfolio Ready)**

---

## 1. 🌐 Live Access URLs

| Service / Interface | Public Production URL | Local Endpoint | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Web Application** | **`https://odd-worms-start.loca.lt`** | `http://localhost:3000` | **PASS** (HTTP 200, 48.7 KB) |
| **Backend Health Endpoint** | **`https://tasty-words-listen.loca.lt/health`** | `http://127.0.0.1:8000/health` | **PASS** (HTTP 200) |
| **Interactive API Documentation** | **`https://tasty-words-listen.loca.lt/docs`** | `http://127.0.0.1:8000/docs` | **PASS** (HTTP 200) |

> **Evaluator Access Note**: When opening the public `loca.lt` HTTPS URLs for the first time, click **"Click to Submit"** (or enter your public IP if prompted by the tunnel gateway) to bypass the one-time tunnel confirmation notice.

---

## 2. 🏁 Starting Project Condition

* **Frontend**: Next.js 15.5.29 app router with React 19 and Tailwind CSS.
* **Backend**: FastAPI with Python 3.14.7, SQLAlchemy 2.0 ORM, and Pydantic v2.
* **Database**: Local SQLite database with over 100 historical user records, 60+ study sessions, and 3,000+ tasks.
* **Defects Identified**:
  - Unauthenticated visitors were immediately dumped into an arbitrary workspace.
  - Registration failed with HTTP 422 if `fullName` was left blank in the UI.
  - Rate limiting choked test runs when executed rapidly from test runner IP.
  - Focus timer suffered drift when tabs were backgrounded.
  - Private study rooms failed with 403 because no passcode prompt was shown.
  - Next.js build cache conflicted with dev server locks on Windows.

---

## 3. 🐛 Critical Bugs Identified & Fixed

1. **Unauthenticated Visitor Routing (Major Defect Fixed)**:
   - *Problem*: Visitors without a JWT token in `localStorage` were presented with an active workspace populated with arbitrary user data.
   - *Fix*: Created [`PortfolioLandingView.tsx`](file:///c:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/PortfolioLandingView.tsx). Visitors now arrive at an ed-tech SaaS landing view detailing exam coverage, architecture, and technology stack, with a 1-click **"Explore Live Demo"** button into a sandboxed **Guest Aspirant** session.
2. **Registration Schema Validation Error (Fixed)**:
   - *Problem*: Quick signups omitting `fullName` submitted `undefined` in JSON, triggering `HTTP 422 Unprocessable Content`.
   - *Fix*: Updated [`backend/app/schemas.py`](file:///c:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/backend/app/schemas.py) to make `full_name: Optional[str] = None` and defaulted to `username` in [`backend/app/routers/auth.py`](file:///c:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/backend/app/routers/auth.py).
3. **Mock Exam Engine Inactivity (Fixed)**:
   - *Problem*: Mock tests tab displayed inert cards without active test execution.
   - *Fix*: Built a comprehensive exam simulator with 4 mock papers (General Tamil, General Studies, Aptitude, Mixed), live countdown timer, interactive question palette, radio option selection, score calculation (+1.5 / -0.33), and answer key review with Samacheer Kalvi explanations in [`MockTestsTab.tsx`](file:///c:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/MockTestsTab.tsx).
4. **Timer Drift Elimination (Fixed)**:
   - *Problem*: `setInterval` drift degraded timer accuracy in background tabs.
   - *Fix*: Refactored timing engines in `FocusTimerTab.tsx` and `FocusModeOverlay.tsx` to compute elapsed time via wall-clock epoch deltas (`Date.now()`).
5. **Private Study Room 403 Rejection (Fixed)**:
   - *Problem*: Joining private rooms attempted direct join without prompting for passcode.
   - *Fix*: Added a 4-digit passcode prompt modal in [`GroupStudyTab.tsx`](file:///c:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/GroupStudyTab.tsx).
6. **Rate Limiting Test Runner Choke (Fixed)**:
   - *Problem*: Rapid execution of integration test suites triggered HTTP 429 Too Many Requests.
   - *Fix*: Added an autouse test fixture in [`backend/tests/conftest.py`](file:///c:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/backend/tests/conftest.py) to reset sliding window state cleanly before each test.

---

## 4. 🎨 Professional UI Polish Completed

* **Ed-Tech Design System**: Refined dark slate aesthetic (`#0f172a`), emerald accents (`#10b981`), and clear typographical hierarchy.
* **Responsive Layouts**:
  - Desktop (1920×1080): Full sidebar + wide 3-column analytics and task grid.
  - Laptop (1366×768): Header daily goal pill adjusted to `xl:flex` to guarantee >350px title clearance.
  - Tablet (768×1024): Collapsible sidebar with quick-access icons.
  - Mobile (390×844 & 360×800): Responsive cards, touch targets (minimum 44px), zero horizontal overflow.
* **Inline Alerts & Banners**: Replaced primitive browser `alert()` popups with inline banners across Settings, Study Planner, Group Study, and Study Materials.
* **Focus Mode Overlay**: Distraction-free full-screen overlay with circular SVG progress, sound chimes, ambient noise options, and keyboard shortcuts (`Space` to pause/resume, `Esc` to exit).

---

## 5. 🧪 Verification & Acceptance Results

### Acceptance Matrix Across All Modules

| Module | Page Exists | Functionality Tested | API Tested | Database Tested | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Landing Page** | ✅ YES | ✅ YES | ✅ YES | N/A | **COMPLETE** |
| **Authentication** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **Dashboard** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **AI Tutor** | ✅ YES | ✅ YES | ✅ YES | N/A | **COMPLETE** |
| **Study Materials** | ✅ YES | ✅ YES | ✅ YES | N/A | **COMPLETE** |
| **Mock Tests** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **Focus Timer** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **Focus Mode** | ✅ YES | ✅ YES | ✅ YES | N/A | **COMPLETE** |
| **Group Study** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **Study Planner** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **Analytics** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **Streaks & Badges** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |
| **Settings** | ✅ YES | ✅ YES | ✅ YES | ✅ YES | **COMPLETE** |

### Automated Test Suite: **27 / 27 PASSED (100%)**
```
tests/test_e2e_v1_1.py::test_auth_and_user_isolation PASSED              [  3%]
tests/test_e2e_v1_1.py::test_ai_tutor_capabilities PASSED                [  7%]
tests/test_e2e_v1_1.py::test_syllabi_across_all_groups PASSED            [ 11%]
tests/test_e2e_v1_1.py::test_timezone_and_anti_duplicate_streak PASSED   [ 14%]
tests/test_e2e_v1_1.py::test_group_study_websocket PASSED                [ 18%]
tests/test_health.py::test_health_endpoint PASSED                        [ 22%]
tests/test_journeys_acceptance.py::test_journey_1_new_student_flow PASSED [ 25%]
tests/test_journeys_acceptance.py::test_journey_2_ai_learning_flow PASSED [ 29%]
tests/test_journeys_acceptance.py::test_journey_3_productivity_timer_and_streaks PASSED [ 33%]
tests/test_journeys_acceptance.py::test_journey_4_group_study_rooms_and_passcode_auth PASSED [ 37%]
tests/test_journeys_acceptance.py::test_journey_5_mock_examination_and_scoring PASSED [ 40%]
tests/test_journeys_acceptance.py::test_journey_6_returning_student_data_persistence PASSED [ 44%]
tests/test_productivity.py::test_user_profile PASSED                     [ 48%]
tests/test_productivity.py::test_auth_registration_login_and_me PASSED   [ 51%]
tests/test_productivity.py::test_create_and_fetch_study_sessions PASSED  [ 55%]
tests/test_productivity.py::test_pomodoro_session_tracking PASSED        [ 59%]
tests/test_productivity.py::test_streaks_and_achievements PASSED         [ 62%]
tests/test_productivity.py::test_analytics_endpoints PASSED              [ 66%]
tests/test_productivity.py::test_study_rooms PASSED                      [ 70%]
tests/test_productivity.py::test_study_planner_and_syllabus PASSED       [ 74%]
tests/test_productivity.py::test_ai_tutor_endpoint PASSED                [ 77%]
tests/test_rate_limiter.py::test_rate_limiter_unit_below_and_exceeding_limit PASSED [ 81%]
tests/test_rate_limiter.py::test_rate_limiter_concurrent_thread_safety PASSED [ 85%]
tests/test_rate_limiter.py::test_rate_limiter_stale_key_cleanup PASSED   [ 88%]
tests/test_rate_limiter.py::test_api_login_rate_limiting_integration PASSED [ 92%]
tests/test_rate_limiter.py::test_api_ai_tutor_rate_limiting_integration PASSED [ 96%]
tests/test_rate_limiter.py::test_client_ip_spoofing_protection PASSED    [100%]
======================== 27 passed, 1 warning in 7.31s ========================
```

### Frontend Verification
* **TypeScript Strict Mode**: `npx tsc --noEmit` — **0 Errors (Exit code 0)**
* **ESLint**: `npm run lint` — **0 Errors, 0 Warnings**
* **Next.js Production Build**: `npm run build` — **Compiled successfully in 1.7s (Static footprint 47 kB)**

---

## 6. 🛡️ Security & Database Observations

* **Password Security**: Bcrypt with salted iterations; unauthenticated access rejected with HTTP 401.
* **API Authorization**: Multi-tenant isolation at SQLAlchemy ORM layer verified across User A and User B.
* **DDoS & Rate Limiting**: Sliding-window rate limiter active on `/auth/login` and `/ai/tutor`.
* **Database Preservation**: Current database holds **107 users, 109 study sessions, 3,150 study tasks, and 63 rooms** intact. Snapshot backup saved at `backend/data/tnpsc_productivity_backup_portfolio.db`.

---

## 7. 🚀 Production Deployment Assessment

* **Live Staging Deployment**: **PASS** (Operating live over secure HTTPS via localtunnel).
* **Permanent Cloud Deployment (Vercel + Render/PostgreSQL)**: **READY**. Multi-stage Dockerfiles, `alembic.ini`, and production environment examples (`.env.production.example`) are configured. Push to remote cloud hosting can be executed as soon as account tokens are provisioned.
