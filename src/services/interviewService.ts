import apiClient from "./apiClient";
import { InterviewSession } from "../types";

export interface InterviewResponseData {
  question: string;
  answer: string;
  technicalScore?: number;
  communicationScore?: number;
  confidenceScore?: number;
  feedback?: string;
}

export const interviewService = {
  async getInterviews(): Promise<InterviewSession[]> {
    const response = await apiClient.get<{ success?: boolean; interviews?: InterviewSession[] } | InterviewSession[]>("/interviews");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data?.interviews)) {
      return data.interviews;
    }
    return [];
  },

  async createInterview(data: {
    title: string;
    company?: string;
    role?: string;
    difficulty: string;
  }): Promise<InterviewSession> {
    const response = await apiClient.post<{ success: boolean; interview: InterviewSession }>("/interviews", data);
    return response.data.interview;
  },

  async getInterviewById(id: string): Promise<InterviewSession> {
    const response = await apiClient.get<{ success: boolean; interview: InterviewSession }>(`/interviews/${id}`);
    return response.data.interview;
  },

  async updateInterview(
    id: string,
    data: {
      status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
      endedAt?: string;
      overallScore?: number;
    }
  ): Promise<InterviewSession> {
    const response = await apiClient.patch<{ success: boolean; interview: InterviewSession }>(`/interviews/${id}`, data);
    return response.data.interview;
  },

  async addInterviewResponse(id: string, data: InterviewResponseData): Promise<any> {
    const response = await apiClient.post<{ success: boolean; response: any }>(`/interviews/${id}/responses`, data);
    return response.data.response;
  },
};

export default interviewService;
