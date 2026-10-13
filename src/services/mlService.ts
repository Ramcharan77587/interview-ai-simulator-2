import apiClient from "./apiClient";

export interface MLQuestion {
  id: string;
  topic: string;
  difficulty: string;
  question: string;
  reference_concepts: string;
  targeted_skill_gaps?: string[];
}

export interface MatchResult {
  success?: boolean;
  is_fallback?: boolean;
  fallback_reason?: string;
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  questions: MLQuestion[];
}

export interface EvaluateResult {
  success?: boolean;
  is_fallback?: boolean;
  fallback_reason?: string;
  technical_score: number;
  clarity_score: number;
  matched_concepts: string[];
  concept_f1: number;
}

export interface ResumeParseResult {
  success?: boolean;
  is_fallback?: boolean;
  filename: string;
  text: string;
  char_count: number;
  word_count: number;
  detected_skills: string[];
}

export interface AudioAnalysisResult {
  success?: boolean;
  is_fallback?: boolean;
  fallback_reason?: string;
  vocal_state: string;
  confidence_score: number;
  f0_hz: number;
  rms_var: number;
  jitter: number;
}

export const mlService = {
  async matchResume(data: {
    resume_text?: string;
    job_description: string;
    difficulty: string;
  }): Promise<MatchResult> {
    const res = await apiClient.post<MatchResult>("/ml/match", data);
    return res.data;
  },

  async evaluateAnswer(data: {
    question: string;
    answer: string;
    concepts: string;
  }): Promise<EvaluateResult> {
    const res = await apiClient.post<EvaluateResult>("/ml/evaluate-answer", data);
    return res.data;
  },

  async parseResume(file: File): Promise<ResumeParseResult> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<ResumeParseResult>("/ml/parse-resume", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async analyzeAudio(audioBlob: Blob, filename = "response.wav"): Promise<AudioAnalysisResult> {
    const formData = new FormData();
    formData.append("file", audioBlob, filename);
    const res = await apiClient.post<AudioAnalysisResult>("/ml/analyze-audio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
};

export default mlService;
