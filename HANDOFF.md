# Project Handoff Document: Interview AI Simulator

**Verified Full-Stack Architecture & Antigravity Migration Reference**  
**Repository State:** Verified & Clean Build (`npm run lint` / `npm run build` passing, ML test suite passing)

---

## 1. Product Summary and Intended Users

### Product Summary
**Interview AI Simulator** is an enterprise-grade, full-stack mock interview preparation web application. It simulates real-time technical and behavioral interviews featuring live camera feed integration, in-browser speech recognition (speech-to-text), speech synthesis (voice questions and verbal AI companion feedback), real-time entity recognition against expected answer concepts, live session telemetry (confidence meter, vocal prosody indicator, session countdown), a dedicated Python FastAPI machine learning microservice for scoring, prosody analysis, and resume skill gap matching, and post-interview AI analysis powered by Google Gemini (`@google/genai` on Express backend) with local heuristic fallbacks.

### Intended Users
- Mid-to-senior software engineering candidates practicing live technical depth, behavioral scenarios, and system design interviews.
- Candidates seeking real-time speech telemetry (prosody, speaking pace, technical keyword coverage) without needing a human interviewer.
- University and enterprise engineering candidates preparing for structured interview panels.

---

## 2. Every Implemented Feature, Grouped by User Flow or Page

### A. Authentication & Splash (`/login`)
- **Branded Splash & Live Analytics Mockup:** Left panel displaying enterprise platform branding with animated telemetry metrics.
- **Google SSO Modal:** Interactive modal explaining Google Workspace SSO simulation.
- **JWT & Bcrypt Authentication:** Secure email and password input fields calling `POST /api/auth/login`. Authenticates against PostgreSQL, returns signed JWT, and initializes `AuthContext`.
- **Partition Request Link:** Navigates user to `/onboarding`.

### B. User Onboarding & Profile Setup (`/onboarding`)
- **Profile Creation Form:** Fields for First Name, Last Name, University / Organization, and email.
- **Interactive Tech Stack Selector:** Toggleable pills for `["Python", "C / C++", "React", "AI/ML", "System Design"]`.
- **Database Synchronization:** Form submission executes `POST /api/user`, updating profile attributes in PostgreSQL via Prisma, then routes to `/dashboard`.

### C. Main Dashboard (`/dashboard`)
- **KPI Metrics Cards:**
  1. *Completed Interviews:* Dynamically computed from user's recorded database sessions. Shows real count (e.g. 0 if fresh user).
  2. *Avg. Tech Score:* Computed from user's real completed session scores (or "—" if pending).
  3. *Upcoming Goal:* "System Design" with calibrated readiness progress bar.
- **Recent Interview Sessions Table:** Fetches authenticated user sessions from `GET /api/interviews`. Displays Role/Topic, Date, Tech Score (`/100`), and Status badge (`Reviewed` / `COMPLETED` / `SCHEDULED`).
- **Honest Empty State:** When no sessions exist, displays a clean empty state with a "Start First Interview" CTA button (no hardcoded fake records).
- **Quick-Start CTA Card:** Direct link to `/setup`.
- **Suggested Practice Bento:** Curated list of weak spots with direct links.

### D. Interview Setup & Calibration (`/setup`)
- **Real Resume Upload & Text Extraction:** Drag-and-drop or file picker accepting `.pdf`, `.txt`, and `.md` (up to 5MB).
  - Plain text and Markdown are parsed directly in-browser.
  - PDF documents are uploaded to `POST /api/ml/parse-resume` and parsed via `pypdf`.
  - Shows parsing spinner, validation, and character count / detected skill badges.
  - If omitted, clearly calibrates using the Job Description only without claiming a resume was analyzed.
- **Target Job Description:** Text area input for target requirements.
- **Difficulty Level Selector:** Dropdown with `Junior`, `Mid-Level`, `Senior`, `Staff / Principal`.
- **Primary Focus Area Selector:** Dropdown with `Technical Depth`, `Behavioral / Culture Fit`, `System Design`, `Comprehensive`.
- **Session Initiation:** Calls `POST /api/interviews` to persist a new `SCHEDULED` session in PostgreSQL scoped to the authenticated user, commits calibrated questions from ML Model 3 to `localStorage`, and routes to `/room`.

### E. Live Interview Room (`/room`)
- **Real-Time Video Feed:** `navigator.mediaDevices.getUserMedia` video and audio capture rendered directly in mirrored canvas (`scale-x-[-1]`). Includes hardware mute/unmute and camera toggles.
- **Active Session Timer & Dual Progress Trackers:** 15:00 countdown clock, question progress bar, time elapsed bar.
- **Global Keyboard Shortcuts:** `[Space]` toggles Pause/Resume; `[Enter]` / `[ArrowRight]` advances question; `[ArrowLeft]` returns to previous question.
- **Interactive Question Engine:** Bank of calibrated technical questions dynamically loaded from ML Model 3 (or curated baseline set).
- **AI Voice Agent Companion Node:**
  - Browser native `SpeechRecognition` continuously transcribes candidate speech and auto-checks expected technical entity keywords in real-time.
  - Browser native `SpeechSynthesis` auto-reads question prompts and verbal feedback with audio feedback loop prevention.
- **Acoustic Prosody & Telemetry:**
  - In-browser `MediaRecorder` captures audio slices from the live microphone stream.
  - Evaluated via `POST /api/ml/analyze-audio` (multipart forward to ML Model 2) to compute fundamental frequency ($F_0$), vocal delivery state (`Confident`, `Steady`, `Hesitant`), and confidence score.
  - Telemetry card displays live Response Confidence and Vocal Delivery State.
- **Database Persistence on Complete:**
  - Candidate answers, technical scores, clarity scores, and acoustic telemetry are persisted to PostgreSQL via `POST /api/interviews/:id/responses`.
  - Session status is updated to `COMPLETED` with finalized overall scores via `PATCH /api/interviews/:id`.

### F. Performance Summary Report (`/report`)
- **Dynamic Header:** Reflects selected interview difficulty and focus.
- **Core Score Cards:** Overall Score, Technical Accuracy, and Communication Clarity computed from ML evaluations.
- **Timeline & Entity Coverage Grid:** Tracks assertion and technical concept coverage.
- **PDF Export:** Supports browser print-to-PDF (`window.print()`).

### G. Question Bank Arena (`/questions`)
- **Curated Scenarios Grid:** Cards featuring System Design, Frontend React, Algorithms, and Behavioral questions.
- **Interactive Client Filtering:** Real-time search by keyword, category, difficulty, and bookmark status.

### H. Account Settings & Preferences (`/settings`)
- **Theme Switcher:** Seamless Dark / Light mode toggle.
- **Settings Categories:** Profile Settings, Preferences, Security, Notifications.
- **"Terminate Session" Button:** Clears JWT authentication and logs out to `/login`.

---

## 3. Data Handling & Persistence

### 1. PostgreSQL Database with Prisma ORM
- **Configuration:** `prisma/schema.prisma` connected via `DATABASE_URL` (Neon PostgreSQL or local instance).
- **Models:**
  - `User`: Handles accounts, password hashes (`bcrypt`), organization, and tech stack.
  - `InterviewSession`: Tracks sessions, role, difficulty, startedAt, endedAt, overallScore, and status (`SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - `InterviewResponse`: Stores individual question responses, transcribed answers, technicalScore, communicationScore, confidenceScore, and qualitative feedback.

### 2. Browser LocalStorage (Ephemeral Client Caching)
- `interview_difficulty`, `interview_focus`, `interview_job_description`: Saved user setup preferences.
- `interview_resume_name`, `interview_resume_text`, `interview_resume_skills`: Extracted resume data.
- `current_session_id`: Active PostgreSQL session identifier for response binding.
- `interview_latest_evaluation`: Most recent ML Model 1 evaluation.
- `interview_audio_telemetry`: Most recent ML Model 2 acoustic prosody telemetry.
- `app-theme`: Active theme preference (`light` or `dark`).

---

## 4. Machine Learning Microservice Specifications

The ML engine runs as an independent Python FastAPI microservice on port `8000`:

| Model | Purpose | Input | Output | Endpoint |
| :--- | :--- | :--- | :--- | :--- |
| **Model 1: Short Answer Evaluator** | Scores technical accuracy and clarity against concept rubrics | JSON `{ question, answer, concepts }` | `technical_score`, `clarity_score`, `matched_concepts`, `concept_f1` | `POST /api/ml/evaluate-answer` |
| **Model 2: Vocal Prosody Classifier** | Analyzes acoustic pitch ($F_0$), jitter, and RMS energy variance from recorded audio | Multipart Audio (`.wav`, `.webm`, `.mp3`) | `vocal_state`, `confidence_score`, `f0_hz`, `rms_var`, `jitter` | `POST /api/ml/analyze-audio` |
| **Model 3: Resume Matcher & Question Generator** | Matches candidate skills to JD and selects targeted interview questions | JSON `{ resume_text, job_description, difficulty }` | `match_score`, `matched_skills`, `missing_skills`, `questions` | `POST /api/ml/match` |
| **Resume Parser** | Extracts raw text and detects technical skills from uploaded document | Multipart File (`.pdf`, `.txt`, `.md`) | `text`, `char_count`, `word_count`, `detected_skills` | `POST /api/ml/parse-resume` |

---

## 5. Authoritative Manifests and Lockfiles

To avoid any confusion across dependency manifests:

1. **Root `package.json` & `package-lock.json` (AUTHORITATIVE FOR WEB APP & SERVER):**
   - Controls the entire full-stack build and runtime.
   - Contains all dependencies for React 19, Vite 6, Tailwind CSS v4, Express 4, Prisma Client, JWT, and Bcrypt.
   - Run `npm install` at project root.
2. **`backend/package.json` (STANDALONE SUB-MANIFEST):**
   - Provided for deploying the Express API backend as an isolated microservice without the frontend Vite bundle.
3. **`models/requirements.txt` (AUTHORITATIVE FOR ML ENGINE):**
   - Controls Python dependencies (FastAPI, PyTorch, Librosa, Scikit-learn, Pypdf).
   - Installed inside a virtual environment (`models/.venv`).

---

## 6. How to Run the Verified Project

### 1. ML Microservice (Terminal 1)
```bash
cd models
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
# source .venv/bin/activate    # macOS / Linux
python app.py
```
> Runs at `http://localhost:8000`. Health check: `http://localhost:8000/health`.

### 2. Full-Stack Web Application (Terminal 2)
```bash
npm run dev
```
> - **Frontend Application:** `http://localhost:3000`  
> - **Backend API:** `http://localhost:5000` (forwarded under `/api/*`)

### 3. Verification & Validation Commands
- `npm run lint`: TypeScript strict type checking (`tsc --noEmit`) $\to$ **Clean (0 errors)**.
- `npm run build`: Production compilation (`vite build` + `esbuild server.ts`) $\to$ **Clean build**.
- `python test_api.py` (in `models/`): Runs FastAPI TestClient verification on all 5 endpoints $\to$ **100% Passing (< 55ms latency)**.
