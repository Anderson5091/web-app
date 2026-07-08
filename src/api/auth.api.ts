import { api } from "./client";
import type { LoginCredentials, RegisterCredentials } from "../types/auth.types";

export const authApi = {
  checkEmail: (email: string) => api.get<{ available: boolean }>("/auth/check-email", { params: { email } }),
  register: (data: RegisterCredentials) => api.post<{ userId: string; phone: string | null; message: string }>("/auth/register", data),
  login: (data: LoginCredentials) => api.post<{ user: any; token: string; refreshToken: string }>("/auth/login", data),
  sendOtp: (userId: string) => api.post("/auth/send-otp", { userId }),
  sendOtpEmail: (userId: string) => api.post("/auth/send-otp-email", { userId }),
  verifyOtp: (userId: string, code: string) => api.post<{ user: any; token: string; refreshToken: string }>("/auth/verify-otp", { userId, code }),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
  me: () => api.get("/auth/me"),
  updateProfile: (data: { fullName?: string; phone?: string; country?: string }) => api.put("/auth/me", data),
};
