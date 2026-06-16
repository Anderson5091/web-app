import { api } from "./client";
import type { LoginCredentials, RegisterCredentials } from "../types/auth.types";

export const authApi = {
  register: (data: RegisterCredentials) => api.post<{ userId: string; email: string; phone: string | null; message: string }>("/auth/register", data),
  login: (data: LoginCredentials) => api.post<{ user: any; token: string; refreshToken: string }>("/auth/login", data),
  sendOtp: (userId: string) => api.post("/auth/send-otp", { userId }),
  sendOtpEmail: (userId: string) => api.post("/auth/send-otp-email", { userId }),
  verifyOtp: (userId: string, code: string) => api.post<{ user: any; token: string; refreshToken: string }>("/auth/verify-otp", { userId, code }),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
  me: () => api.get("/auth/me"),
};
