import { api } from "./client";
import type { LoginCredentials, RegisterCredentials } from "../types/auth.types";

export const authApi = {
  register: (data: RegisterCredentials) => api.post<{ user: any; token: string; refreshToken: string }>("/auth/register", data),
  login: (data: LoginCredentials) => api.post<{ user: any; token: string; refreshToken: string }>("/auth/login", data),
  sendOtp: (registrationToken: string) => api.post("/auth/send-otp", { token: registrationToken }),
  sendOtpEmail: (registrationToken: string) => api.post("/auth/send-otp-email", { token: registrationToken }),
  verifyOtp: (registrationToken: string, code: string) => api.post<{ user: any; token: string; refreshToken: string }>("/auth/verify-otp", { token: registrationToken, code }),
  logout: () => api.post("/auth/logout"),
  refresh: () => api.post("/auth/refresh"),
  me: () => api.get("/auth/me"),
};
