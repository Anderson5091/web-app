import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../auth.store";
import { AuthService } from "../services/auth.service";
import type { LoginCredentials, RegisterCredentials } from "../types";

/**
 * Custom hook encapsulating authentication logic.
 * Provides login, register, logout, and user fetch operations
 * with integrated store management.
 */
export function useAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const data = await AuthService.login(credentials);
      setAuth(data.user, data.token, data.refreshToken);
      return data;
    },
    [setAuth]
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
      const data = await AuthService.register(credentials);
      return data;
    },
    []
  );

  const logout = useCallback(() => {
    logoutStore();
    navigate("/login");
  }, [logoutStore, navigate]);

  const fetchUser = useCallback(async () => {
    const data = await AuthService.me();
    if (data?.user && token) {
      setAuth(data.user, token);
    }
    return data;
  }, [setAuth, token]);

  return {
    user,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    fetchUser,
  };
}
