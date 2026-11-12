# TNPSC AI Study Companion – Internship Portfolio Readiness Report

**Project:** TNPSC AI Study Companion  
**Edition:** Software Engineering & AI Research Internship Portfolio Edition  
**Date:** November 12, 2026  
**Auditor / Roles:** Senior Full-Stack Engineer, QA Automation Engineer, AI Systems Researcher, Backend Security & DevOps Engineer  
**Status:** ✅ **PORTFOLIO READY (STAGING VERIFIED)**

---

## 1. Executive Summary

The **TNPSC AI Study Companion** has been audited, debugged, and elevated into a portfolio-grade application prepared specifically for a software engineering and AI research internship application.

The application satisfies all target criteria:
- **Demonstrable without Mandatory Sign-In:** Unauthenticated visitors landing on the site (`/`) are immediately welcomed by an authoritative, high-impact **Portfolio Landing Page** detailing system architecture, syllabus coverage, engineering tech stack, and transparent AI research boundaries.
- **Interactive Safe Demo Mode:** Visitors can click **"Launch Live Workspace"** or **"Explore Live Demo"** to access all 13 modules in a sandboxed Guest Aspirant session with authentic sample data, with zero risk of viewing or corrupting real user records.
- **Zero Console / Build Errors:** 0 TypeScript compile errors, 0 ESLint warnings, Next.js 15.5 production bundle compiled in 5.7s.
- **Backend Quality:** 21 / 21 pytest automated tests passing (100%), including rate limiting, JWT isolation, WebSocket sync, and PBKDF2 password hashing.
- **Data Integrity:** All 45 registered users, 60 study sessions, 1350 syllabus tasks, and 34 rooms in the SQLite database remain completely intact. A timestamped snapshot backup (`tnpsc_productivity_backup_portfolio.db`) was created.
- **Deployment Status:** In accordance with explicit instructions, **no live remote production deployment was executed without approval**. Staging containers, environment templates, and multi-stage Dockerfiles are verified and deployment-ready.

---

## 2. Stage 1: Real Browser Inspection & Prioritized Issue List

A comprehensive audit was executed across the running frontend (`http://localhost:3000`) and backend (`http://127.0.0.1:8000`).

| Priority | Issue ID | Module | Observation & Impact |
|---|---|---|---|
| **CRITICAL** | `CRIT-01` | Landing & Demo Flow | Prior to this phase, visitors with no token triggered a 401 on `GET /api/auth/me`, which fell back to hardcoded user credentials (*Karthik Raja*) directly in the workspace instead of displaying a professional public landing page or clean demo mode. |
| **HIGH** | `HIGH-01` | Sidebar User Card | Sidebar footer displayed hardcoded initials *"KR"* and *"Karthik Raja"* regardless of whether a new user signed in or a guest was exploring. |
| **HIGH** | `HIGH-02` | Header Layout & Truncation | On viewports between 850px and 1024px (e.g. standard laptops with sidebar open), the header title container had only ~44px of clearance, truncating titles into *"Product..."*. |
| **HIGH** | `HIGH-03` | Streak Desynchronization | Streak counter displayed `0d` in the header flame badge while the Streaks & Badges tab showed `Current Streak: 2 Days`. |
| **MEDIUM** | `MED-01` | Sidebar Height & Inner Scroll | On 768px laptop viewport heights, the sidebar navigation list exceeded vertical space, rendering an inner scrollbar. |
| **MEDIUM** | `MED-02` | Next.js Dev Badge Collision | The Next.js dev indicator docked at the bottom-left corner directly on top of the user profile badge. |
| **LOW** | `LOW-01` | Landing Copy Authenticity | Early development preview had placeholder text ("Capture a page") rather than explaining the production architecture, technologies, and AI capabilities. |

---

## 3. Stages 2 & 3: Functional Fixes & Professional UI Polish

### A. Dynamic User Footer in Sidebar ([Sidebar.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/Sidebar.tsx))
- **Fix:** Refactored `Sidebar` to accept `user?: UserProfile | null`.
- **Behavior:**
  - Authenticated User: Displays dynamic initials, full name, and selected exam target.
  - Guest Demo Visitor: Displays `"GA"`, `"Guest Aspirant"`, and `"Target: TNPSC Group 4"`.
  - Tightened spacing from `py-2.5` to `py-2` with `scrollbar-none`, eliminating vertical scrollbar on standard 768px laptop displays.

### B. Header Viewport Clearance ([Header.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/Header.tsx))
- **Fix:**
  - Shifted the secondary Daily Goal Progress Pill from `md:flex` to `xl:flex`.
  - Hid secondary text on the Focus Session button below `lg` screens (`hidden lg:inline`).
  - Added `min-w-0` and truncation to the title container.
- **Result:** Provides over 350px of horizontal breathing room across 850px–1024px viewports; 0px horizontal blowout across all resolutions.

### C. Unified Streak Synchronization ([page.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/app/page.tsx))
- **Fix:** Synchronized fallback demo streak state (`current_streak: 2`, `longest_streak: 5`, `today_seconds: 2400`, `total_seconds: 16200`, `total_sessions: 9`) matching the Streaks & Badges calendar markers across Header, Sidebar, Dashboard, and Achievements.

### D. Multi-Module Interactivity Enhancements
- **Mock Tests ([MockTestsTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/MockTestsTab.tsx)):** Interactive modal with official TNPSC negative marking rules (-0.33), bilingual instructions, and question preview simulation.
- **Study Materials ([StudyMaterialsTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/StudyMaterialsTab.tsx)):** Interactive textbook reader modal highlighting SCERT Samacheer Kalvi chapter compendiums.
- **Focus Timer & Overlay ([FocusTimerTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/FocusTimerTab.tsx), [FocusModeOverlay.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/FocusModeOverlay.tsx)):** Wall-clock epoch drift elimination, auto-phase transition, Web Audio synthesizer, and `Escape` / `Space` keyboard controls.
- **Group Study ([GroupStudyTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/GroupStudyTab.tsx)):** Fixed private room join protocol, WebSocket live status broadcasting, and inline error banners.

---

## 4. Stage 4: Portfolio Landing Page & Safe Demo Mode

Implemented a dedicated component: [PortfolioLandingView.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/PortfolioLandingView.tsx).

### Key Architectural Sections:
1. **Hero & Value Proposition:**
   - Highlights the dual focus of **deep focus habits** and **grounded AI retrieval**.
   - Clear calls to action: *"Launch Live Workspace (No Sign-in Required)"* and *"Sign In / Create Account"*.
2. **Context & Motivation (Why TNPSC?):**
   - Details the real challenges of civil service aspirants (study drift, generic LLM hallucinations in state-specific exams, syllabus isolation).
   - Explains how epoch-accurate timers, textbook grounding, and WebSocket rooms address each challenge.
3. **Interactive Genuine Product Showcase:**
   - Visitors can tab through 6 live interactive module cards directly on the landing page:
     - Command Center KPI cards
     - Focus & Pomodoro circular timer with subject selector
     - Grounded AI Tutor Q&A preview citing SCERT textbooks
     - AI Study Planner roadmap with spaced revision tags
     - Group Study Rooms with live participant counters
     - Circadian Productivity Analytics with 7-day distribution chart
4. **Full-Stack Engineering Specifications:**
   - Transparent breakdown of Frontend (Next.js 15.5, React 19, TypeScript), Backend (FastAPI, SQLAlchemy 2.0, Starlette WebSockets), Security (PBKDF2, PyJWT, rate limiters), and AI grounding.
5. **AI Research Disclosure & Methodological Limitations:**
   - **Capabilities:** Grounded strictly in Tamil Nadu SCERT Samacheer Kalvi school textbooks (Standards 6–12); native Tamil Unicode script rendering; transparent source attribution.
   - **Research Boundaries:** Does not predict future official question papers; rejects ungrounded trivia queries to eliminate hallucinations; does not substitute for government gazettes.
6. **Safe Demo Mode Mechanics:**
   - Unauthenticated visitors entering the workspace explore as a sandboxed **Guest Aspirant** (`isGuest: true`).
   - A distinct gradient notification banner informs them: *"Portfolio Demo Mode: Exploring as Guest Aspirant with sample syllabus data. [Portfolio Overview] [Sign In / Register]"*.
   - Zero private user records or passwords are leaked or exposed to public visitors.

---

## 5. Stage 5: Verification & Test Execution Evidence

### A. Backend Pytest Suite
```powershell
pytest -v
```
**Result:** **21 / 21 Passed (100%) in 6.33s**
- `test_auth_and_user_isolation`: PASSED
- `test_ai_tutor_capabilities`: PASSED
- `test_syllabi_across_all_groups`: PASSED
- `test_timezone_and_anti_duplicate_streak`: PASSED
- `test_group_study_websocket`: PASSED
- `test_health_endpoint`: PASSED
- `test_user_profile`: PASSED
- `test_auth_registration_login_and_me`: PASSED
- `test_create_and_fetch_study_sessions`: PASSED
- `test_pomodoro_session_tracking`: PASSED
- `test_streaks_and_achievements`: PASSED
- `test_analytics_endpoints`: PASSED
- `test_study_rooms`: PASSED
- `test_study_planner_and_syllabus`: PASSED
- `test_ai_tutor_endpoint`: PASSED
- `test_rate_limiter_unit_below_and_exceeding_limit`: PASSED
- `test_rate_limiter_concurrent_thread_safety`: PASSED
- `test_rate_limiter_stale_key_cleanup`: PASSED
- `test_api_login_rate_limiting_integration`: PASSED
- `test_api_ai_tutor_rate_limiting_integration`: PASSED
- `test_client_ip_spoofing_protection`: PASSED

### B. Frontend Linter (`npm run lint`)
**Result:** **0 Errors, 0 Warnings**
Clean ESLint output adhering to React 19 and Next.js 15 rules.

### C. Frontend Production Build (`npm run build`)
**Result:** **Compiled successfully in 5.7s**
```
Route (app)                                 Size  First Load JS
┌ ○ /                                      42 kB         145 kB
└ ○ /_not-found                            995 B         104 kB
+ First Load JS shared by all             103 kB
○  (Static)  prerendered as static content
```

### D. 5-Viewport Responsive Verification Matrix
- **1920 × 1080 (Desktop):** Expansive 4-column KPI grid, 3-column room grid, persistent sidebar.
- **1366 × 768 (Laptop):** Zero sidebar vertical scrollbar, clean card margins, optimal readability.
- **768 × 1024 (Tablet):** Responsive hamburger drawer transition, 2-column layout, zero horizontal blowout.
- **390 × 844 (Mobile):** Truncated title with full button clearance, single-column stacked viewports.
- **360 × 800 (Small Mobile):** SVG circular progress ring scales smoothly to `w-60 h-60`, 44px touch targets.

---

## 6. Stage 6: Deployment Preparation & Checklist

| Component | Status | Production Specification |
|---|---|---|
| **Python Runtime** | ✅ Verified | Python 3.14 (FastAPI + SQLAlchemy 2.0 async engine) |
| **Node.js Runtime** | ✅ Verified | Node.js 20+ LTS (Next.js 15.5 App Router) |
| **Dockerfiles** | ✅ Verified | Multi-stage `frontend/Dockerfile` & unbuffered non-root `backend/Dockerfile` |
| **Docker Compose** | ✅ Verified | `docker-compose.yml` with healthchecks and persistent data volume |
| **Dual Database Engine** | ✅ Verified | Dual SQLite (`sqlite:///./data/tnpsc_productivity.db`) and PostgreSQL support |
| **Database Migrations** | ✅ Verified | Alembic baseline migration `6e19ca999c2f` at HEAD |
| **Rate Limiting** | ✅ Verified | Sliding-window limiter on sensitive endpoints (`/auth`, `/ai/tutor`, `/rooms`) |
| **Security Headers** | ✅ Verified | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin` |
| **HTTPS / WSS Ready** | ✅ Verified | Dual protocol detection (`wss://` on HTTPS, `ws://` on HTTP) |
| **Deployment Authorization** | ⏸️ **HELD** | Live remote deployment withheld pending explicit user approval |

---

## 7. Modified & Created Files

1. [PortfolioLandingView.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/PortfolioLandingView.tsx) *(NEW)*
   - Full portfolio presentation: Hero, architecture specifications, AI research disclosure, interactive showcase, and CTAs.
2. [page.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/app/page.tsx)
   - Integrated Portfolio Landing View, safe guest demo mode, demo notice banner, and dynamic user routing.
3. [Header.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/Header.tsx)
   - Resolved header title truncation on 850px–1024px viewports; responsive pill visibility.
4. [Sidebar.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/Sidebar.tsx)
   - Dynamic user initials and name rendering; compact spacing eliminating inner scrollbar.
5. [FocusTimerTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/FocusTimerTab.tsx)
   - Prop-priority topic synchronization; responsive circular SVG ring.
6. [GroupStudyTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/GroupStudyTab.tsx)
   - Private room passcode modal protocol; inline error handling.
7. [FocusModeOverlay.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/FocusModeOverlay.tsx)
   - Keyboard shortcuts (`Escape`, `Space`); responsive digital clock font scaling.
8. [MockTestsTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/MockTestsTab.tsx)
   - Replaced browser `alert()` with interactive Exam Simulation Modal.
9. [StudyMaterialsTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/StudyMaterialsTab.tsx)
   - Replaced browser `alert()` with interactive SCERT Textbook Reader Modal.
10. [SettingsTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/SettingsTab.tsx)
    - Replaced browser `alert()` with inline error alert banner.
11. [StudyPlannerTab.tsx](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/frontend/src/components/StudyPlannerTab.tsx)
    - Replaced browser `alert()` with inline error alert banner.
12. [TNPSC_PORTFOLIO_READINESS_REPORT.md](file:///C:/Users/selva/Downloads/tnpsc-ai-companion-starter/tnpsc-ai-companion/TNPSC_PORTFOLIO_READINESS_REPORT.md) *(NEW)*
    - Comprehensive audit, verification, and internship portfolio readiness report.

---

## 8. Remaining Deployment Blockers

- **Live Production Credentials:** Provisioning live `GEMINI_API_KEY` for Google Gemini reasoning in production environments (the resilient grounded offline fallback functions without disruption).
- **Target Remote Host Selection:** Awaiting user decision on cloud deployment target (e.g., Render, Railway, Fly.io, or AWS EC2).
- **Domain & SSL Binding:** Linking custom domain and provisioning managed TLS certificates upon cloud deploy.
