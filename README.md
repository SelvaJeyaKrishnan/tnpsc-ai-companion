# TNPSC AI Companion

An AI-powered learning and revision platform for TNPSC aspirants.

## Monorepo structure

- `frontend/` — Next.js + TypeScript web application
- `backend/` — Python + FastAPI API
- `docs/` — architecture and engineering notes

## Prerequisites

- Node.js 22 or newer (LTS recommended)
- Python 3.11 or newer
- Git
- VS Code

## 1. Start the frontend (Windows PowerShell)

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## 2. Start the backend (second PowerShell terminal)

```powershell
cd backend
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs and http://localhost:8000/health.

If PowerShell blocks virtual-environment activation, run this once in the current terminal:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## 3. Git initialization

From the repository root:

```powershell
git init
git add .
git commit -m "chore: initialize TNPSC AI Companion monorepo"
```

Create an empty GitHub repository named `tnpsc-ai-companion`, then connect it:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/tnpsc-ai-companion.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username. Do not share access tokens or passwords.

## Current milestone

The scaffold includes:
- Responsive landing/dashboard starter UI
- FastAPI application with health endpoint
- Environment-variable examples
- Initial architecture notes

OCR, authentication, database persistence, RAG, source verification and revision scheduling are not implemented yet. They will be added in separate tested milestones.

## Security

- Never commit `.env`, `.env.local`, API keys, credentials, uploaded student documents or database dumps.
- Keep private student content isolated by authenticated user ID.
- Do not expose LLM provider keys in browser code.
