export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  organization?: string | null;
  techStack?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface InterviewSession {
  id: string;
  title: string;
  company?: string | null;
  role?: string | null;
  difficulty: string;
  startedAt: string;
  endedAt?: string | null;
  overallScore?: number | null;
  technical_score?: number | null;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "Reviewed";
  date?: string;
  topic?: string;
}

export interface AiAnalysisResult {
  confidence: number;
  pacing: string;
  entities: string[];
  summary: string;
  error?: string;
}

export interface QuestionBankItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: string;
  bookmarked: boolean;
}
