# Interview AI Simulator

An enterprise-grade, full-stack mock interview platform designed for software engineering candidates. Features real-time webcam and microphone feeds, in-browser speech recognition (STT) and voice synthesis (TTS), live response telemetry, a Python FastAPI machine learning microservice for scoring and prosody analysis, and post-interview AI diagnostic reports.

---

## 🏗️ System Architecture

The project is structured as a unified monorepo connecting a modern React client, an Express.js backend with Prisma ORM, and a dedicated FastAPI Python ML engine:

```
interview-ai-simulator/
├── src/                  # React 19 + TypeScript + Vite + Tailwind CSS Frontend
│   ├── components/       # UI Shell, Sidebar, Topbar, Modals
│   ├── context/          # AuthContext & Session Management
│   ├── pages/            # Login, Onboarding, Dashboard, Setup, Room, Report, QuestionBank
│   ├── services/         # API Clients (Auth, Interviews, ML Service)
│   └── types/            # TypeScript interfaces & domain models
│
├── backend/              # Express.js REST API & Integration Gateway (Port 5000)
│   ├── src/
│   │   ├── config/       # Prisma Client & environment loader
│   │   ├── controllers/  # Auth, User, and Interview controllers
│   │   ├── middleware/   # JWT verification & Rate Limiting (auth/ai limiters)
│   │   ├── routes/       # Auth, User, Interview, Gemini AI, & ML proxy routes
│   │   └── server.ts     # Standalone backend server entry
│   └── package.json
│
├── models/               # Python 3.10+ FastAPI Machine Learning Engine (Port 8000)
│   ├── app.py            # FastAPI inference application & lifespan manager
│   ├── requirements.txt  # Python ML dependencies (FastAPI, PyTorch, Librosa, Scikit-learn)
│   ├── test_api.py       # Automated TestClient latency & accuracy verification suite
│   ├── exports/          # Serialized production model artifacts (.joblib, ~223 KB total)
│   │   ├── model1_baseline.joblib         # Model 1: Response Scorer
│   │   ├── model2_audio_confidence.joblib # Model 2: Vocal Prosody Classifier
│   │   └── model3_matcher.joblib          # Model 3: Resume-Job Matcher & Question Generator
│   ├── src/
│   │   ├── features/     # Acoustic prosody & skill entity extractors
│   │   └── models/       # Model trainers, evaluators, and test fixtures
│   └── data/             # Training datasets, manifests, and question templates
│
├── prisma/               # Prisma Database Schema (PostgreSQL / Neon DB)
│   └── schema.prisma     # User, InterviewSession, and InterviewResponse models
│
├── server.ts             # Full-Stack Orchestrator (Bridges Express + Vite dev server)
├── package.json          # Root scripts & unified dependencies
├── vite.config.ts        # Vite configuration & backend proxy
└── .env.example          # Environment variable template
```

---

## 🤖 Machine Learning Models Overview

The ML engine runs as an independent microservice on port `8000`:

| Model | Purpose | Input | Output | Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Model 1: Response Scorer** | Evaluates candidate answer against technical rubrics and key concepts | `{ question, answer, concepts }` | `technical_score` (0-100), `clarity_score` (0-100), `matched_concepts`, `concept_f1` | `POST /api/ml/evaluate-answer` |
| **Model 2: Vocal Prosody Classifier** | Extracts acoustic pitch ($F_0$), jitter, and energy variance to assess delivery confidence | Uploaded Audio File (`.wav`, `.mp3`) | `vocal_state` (`Steady`, `Confident`), `confidence_score`, $F_0$, RMS variance, jitter | `POST /api/ml/analyze-audio` |
| **Model 3: Resume-to-Job Matcher** | Compares candidate skills against job requirements and generates calibrated questions | `{ resume_text, job_description, difficulty }` | `match_score`, `matched_skills`, `missing_skills`, `questions` (calibrated set) | `POST /api/ml/match` |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 to v3.13
- **PostgreSQL Database**: [Neon](https://neon.tech) or a local PostgreSQL instance

---

### Step 1: Environment Setup

Copy `.env.example` to `.env` in the root directory:

```bash
cp .env.example .env
```

Configure your `.env` variables:
```env
# Database Connection
DATABASE_URL="postgresql://user:password@hostname:5432/dbname?sslmode=require"

# JWT Secret
JWT_SECRET="your_secure_jwt_secret_key_here"

# Ports
PORT=5000
BACKEND_PORT=5000
FRONTEND_PORT=3000

# ML Microservice URL
ML_SERVICE_URL="http://127.0.0.1:8000"

# Optional Gemini API Key (Server falls back to heuristics if omitted)
GEMINI_API_KEY=""
```

---

### Step 2: Install Web App & Backend Dependencies

From the project root:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Generate Prisma Client
npx prisma generate
```

---

### Step 3: Set Up the ML Microservice

From the `models/` folder:

```bash
cd models

# 1. Create a Python virtual environment
python -m venv .venv

# 2. Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Verify model loading and test endpoints
python test_api.py
```

---

### Step 4: Run the Application

#### 1. Start the ML Engine (Terminal 1)
```bash
cd models
# With virtual environment activated:
python app.py
```
> The ML Engine starts at: `http://localhost:8000` (Health check at `http://localhost:8000/health`)

#### 2. Start the Full-Stack Web App (Terminal 2)
From the project root:
```bash
npm run dev
```
> - **Frontend Web App**: `http://localhost:3000`
> - **Backend API**: `http://localhost:5000` (Forwarded seamlessly under `/api/*`)

---

## 🧪 Verification & Build Commands

| Command | Action |
| :--- | :--- |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run build` | Builds Vite production bundle + bundles Express with `esbuild` to `dist/server.cjs` |
| `npm start` | Runs production server (`node dist/server.cjs`) |
| `python test_api.py` (in `models/`) | Runs automated latency & accuracy test suite on all 3 ML models |

---

## 🔒 Security & Privacy Notice
- Never commit `.env` files or API secrets. `.env` is ignored by `.gitignore`.
- Model weight artifacts in `models/exports/` are lightweight (`~223 KB` total requirements) and tracked directly in Git without requiring Git LFS.
- Audio recordings are processed ephemerally in temp memory and removed after feature extraction.
