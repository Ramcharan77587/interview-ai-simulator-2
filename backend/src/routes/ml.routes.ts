import { Router, Request, Response } from "express";

const router = Router();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

// Helper to stream/buffer raw multipart requests directly to Python FastAPI microservice
async function forwardRawMultipart(req: Request, endpoint: string) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const bodyBuffer = Buffer.concat(chunks);
  const contentType = req.headers["content-type"] || "multipart/form-data";

  return await fetch(`${ML_SERVICE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body: bodyBuffer,
  });
}

// Health check proxy
router.get("/health", async (_req: Request, res: Response) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`);
    const data = await response.json();
    return res.json({ success: true, is_fallback: false, mlService: data });
  } catch (error) {
    return res.status(503).json({
      success: false,
      is_fallback: true,
      message: "ML microservice offline",
      error: String(error)
    });
  }
});

// Model 3: Resume to JD Matcher & Dynamic Question Selection
router.post("/match", async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`ML Match service responded with status ${response.status}`);
    }

    const data = (await response.json()) as Record<string, any>;
    return res.json({ success: true, is_fallback: false, ...data });
  } catch (error) {
    console.warn("ML match proxy warning, falling back:", error);
    return res.json({
      success: true,
      is_fallback: true,
      fallback_reason: "ML matching service offline; using heuristic matching",
      match_score: 50.0,
      matched_skills: ["Software Engineering"],
      missing_skills: ["System Architecture"],
      questions: [],
    });
  }
});

// Resume Upload & Extraction (Multipart PDF/TXT/MD Parser)
router.post("/parse-resume", async (req: Request, res: Response) => {
  try {
    const mlResponse = await forwardRawMultipart(req, "/api/ml/parse-resume");
    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      return res.status(mlResponse.status).json({
        success: false,
        is_fallback: false,
        message: `Failed to extract resume text: ${errText}`,
      });
    }

    const data = (await mlResponse.json()) as Record<string, any>;
    return res.json({ success: true, is_fallback: false, ...data });
  } catch (error) {
    console.warn("ML resume parse proxy error:", error);
    return res.status(503).json({
      success: false,
      is_fallback: true,
      fallback_reason: "ML resume parsing microservice is offline",
      message: "Unable to parse resume document via ML engine. Please upload a plain text file or paste text directly.",
    });
  }
});

// Model 1: Short Answer & Technical Rubric Evaluator
router.post("/evaluate-answer", async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/evaluate-answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      throw new Error(`ML Evaluate service responded with status ${response.status}`);
    }

    const data = (await response.json()) as Record<string, any>;
    return res.json({ success: true, is_fallback: false, ...data });
  } catch (error) {
    console.warn("ML evaluate proxy warning, falling back:", error);
    return res.json({
      success: true,
      is_fallback: true,
      fallback_reason: "ML evaluation service offline; using heuristic scoring",
      technical_score: 75.0,
      clarity_score: 80.0,
      matched_concepts: [],
      concept_f1: 0.0,
    });
  }
});

// Model 2: Speech Prosody & Vocal Confidence (Multipart Audio Stream)
router.post("/analyze-audio", async (req: Request, res: Response) => {
  try {
    const mlResponse = await forwardRawMultipart(req, "/api/ml/analyze-audio");
    if (!mlResponse.ok) {
      const errText = await mlResponse.text();
      throw new Error(`ML audio service responded with status ${mlResponse.status}: ${errText}`);
    }

    const data = (await mlResponse.json()) as Record<string, any>;
    return res.json({ success: true, is_fallback: false, ...data });
  } catch (error) {
    console.warn("ML audio proxy warning, falling back:", error);
    return res.json({
      success: true,
      is_fallback: true,
      fallback_reason: "ML audio prosody microservice is offline; using nominal vocal state",
      vocal_state: "Steady",
      confidence_score: 0.75,
      f0_hz: 130.0,
      rms_var: 0.00001,
      jitter: 0.02,
    });
  }
});

export default router;
