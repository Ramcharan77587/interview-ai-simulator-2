"""
Production FastAPI Serving API for Interview AI Simulator ML Engine.
Hosts Model 1 (Response Scorer), Model 2 (Vocal Confidence), and Model 3 (Resume Matcher).
"""
import sys
import tempfile
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure repo root is on sys.path for joblib unpickling
REPO_ROOT = Path(__file__).resolve().parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from src.models.baseline_evaluator import compute_concept_f1, ResponseFeatureExtractor, CandidateScorer
from src.features.audio_features import extract_features_from_audio
from src.models.resume_matcher import ResumeJobMatcher

# Alias classes on __main__ for unpickling compatibility
import __main__
__main__.CandidateScorer = CandidateScorer
__main__.ResponseFeatureExtractor = ResponseFeatureExtractor


# --- Lifespan Context Manager ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load all 3 models into application state on startup
    m1_path = Path("exports/model1_baseline.joblib")
    m2_path = Path("exports/model2_audio_confidence.joblib")
    m3_path = Path("exports/model3_matcher.joblib")

    if not (m1_path.exists() and m2_path.exists() and m3_path.exists()):
        raise RuntimeError("Model artifacts missing in exports/. Train models before starting API.")

    app.state.model1 = joblib.load(m1_path)
    app.state.model2 = joblib.load(m2_path)
    app.state.model3 = joblib.load(m3_path)
    
    # Pre-warm JIT and pipelines
    _ = app.state.model1.predict(pd.DataFrame([{
        "question": "warmup", "concepts": "warmup", "answer": "warmup"
    }]))
    
    print("All 3 ML models loaded successfully.")
    yield


app = FastAPI(
    title="Interview AI Simulator - ML Engine",
    description="Production ML inference endpoints for scoring candidate responses, vocal prosody, and resume-job matching.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for local frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request & Response Schemas ---
class MatchRequest(BaseModel):
    resume_text: str = Field(..., description="Plain text or parsed resume contents")
    job_description: str = Field(..., description="Target job description")
    difficulty: str = Field(default="Senior", description="Interview level: Senior, Mid, Junior")


class MatchResponse(BaseModel):
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    questions: List[dict]


class EvaluateAnswerRequest(BaseModel):
    question: str = Field(..., description="Interview question text")
    answer: str = Field(..., description="Candidate transcribed response")
    concepts: str = Field(..., description="Expected rubric / key concepts (comma-separated)")


class EvaluateAnswerResponse(BaseModel):
    technical_score: float
    clarity_score: float
    matched_concepts: List[str]
    concept_f1: float


class AudioAnalysisResponse(BaseModel):
    vocal_state: str
    confidence_score: float
    f0_hz: float
    rms_var: float
    jitter: float


class ResumeParseResponse(BaseModel):
    success: bool
    filename: str
    text: str
    char_count: int
    word_count: int
    detected_skills: List[str]


# --- API Endpoints ---
@app.get("/health")
def health_check():
    """Returns service health and loaded model count."""
    loaded = sum([
        hasattr(app.state, "model1") and app.state.model1 is not None,
        hasattr(app.state, "model2") and app.state.model2 is not None,
        hasattr(app.state, "model3") and app.state.model3 is not None
    ])
    return {
        "status": "healthy",
        "models_loaded": loaded
    }


@app.post("/api/ml/parse-resume", response_model=ResumeParseResponse)
async def parse_resume_document(file: UploadFile = File(...)):
    """Extracts raw text content from uploaded PDF, TXT, or MD resume."""
    filename = file.filename or "resume.pdf"
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded resume file is empty.")
    
    text = ""
    if filename.lower().endswith(".pdf"):
        try:
            import io, pypdf
            reader = pypdf.PdfReader(io.BytesIO(content))
            pages = [page.extract_text() or "" for page in reader.pages]
            text = "\n".join(pages).strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"PDF extraction error: {str(e)}")
    else:
        text = content.decode("utf-8", errors="ignore").strip()
    
    if not text or len(text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text. Ensure the file contains selectable text."
        )
    
    from src.features.skill_extractor import extract_skills
    skills = sorted(list(extract_skills(text)))
    
    return ResumeParseResponse(
        success=True,
        filename=filename,
        text=text,
        char_count=len(text),
        word_count=len(text.split()),
        detected_skills=skills[:15]
    )



@app.post("/api/ml/match", response_model=MatchResponse)
def match_resume_to_job(req: MatchRequest):
    """Computes resume-to-job match score, extracts skill gaps, and selects targeted questions."""
    matcher: ResumeJobMatcher = app.state.model3
    result = matcher.evaluate_candidate(
        resume_source=req.resume_text,
        jd_source=req.job_description,
        num_questions=4,
        difficulty=req.difficulty
    )
    return MatchResponse(
        match_score=result["match_analysis"]["overall_match_score"],
        matched_skills=result["match_analysis"]["matched_skills"],
        missing_skills=result["match_analysis"]["missing_skills"],
        questions=result["targeted_interview_questions"]
    )


@app.post("/api/ml/evaluate-answer", response_model=EvaluateAnswerResponse)
def evaluate_candidate_answer(req: EvaluateAnswerRequest):
    """Scores candidate technical accuracy and clarity, calculating concept rubric coverage."""
    df_input = pd.DataFrame([{
        "question": req.question,
        "concepts": req.concepts,
        "answer": req.answer
    }])
    
    preds = app.state.model1.predict(df_input)
    tech_score = round(float(preds[0, 0]), 1)
    clarity_score = round(float(preds[0, 1]), 1)

    # Concept breakdown
    ref_tokens = [c.strip() for c in req.concepts.split(",") if c.strip()]
    matched = [c for c in ref_tokens if c.lower() in req.answer.lower()]
    f1 = compute_concept_f1(req.answer, req.concepts)

    return EvaluateAnswerResponse(
        technical_score=tech_score,
        clarity_score=clarity_score,
        matched_concepts=matched,
        concept_f1=round(float(f1), 4)
    )


@app.post("/api/ml/analyze-audio", response_model=AudioAnalysisResponse)
async def analyze_vocal_confidence(file: UploadFile = File(...)):
    """Extracts acoustic prosody features from uploaded audio clip and classifies confidence state."""
    suffix = Path(file.filename or "audio.wav").suffix or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        feats = extract_features_from_audio(tmp_path)
        bundle = app.state.model2
        pipeline = bundle["pipeline"]
        feature_cols = bundle["feature_cols"]

        feat_vector = np.array([[feats[c] for c in feature_cols]])
        pred_class = pipeline.predict(feat_vector)[0]
        probs = pipeline.predict_proba(feat_vector)[0]
        max_prob = float(np.max(probs))

        return AudioAnalysisResponse(
            vocal_state=str(pred_class),
            confidence_score=round(max_prob, 4),
            f0_hz=round(float(feats["f0_mean"]), 1),
            rms_var=round(float(feats["rms_var"]), 6),
            jitter=round(float(feats["f0_jitter"]), 4)
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Audio processing error: {str(e)}")
    finally:
        Path(tmp_path).unlink(missing_ok=True)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
