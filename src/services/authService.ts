import apiClient from "./apiClient";
import { AuthResponse, User } from "../types";

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    organization?: string;
    techStack?: string;
    website_url_hp?: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", {
      ...data,
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
    });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ success: boolean; user: User }>("/auth/me");
    return response.data.user;
  },
};

export default authService;
