import { create } from "zustand";
import { setToken, clearToken, setRefreshToken, clearRefreshToken } from "../../utils/token";
import type { User } from "../../types/auth.types";

type AuthState = {
  user: User | null;
  token: string | null;
  sessionExpired: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  setSessionExpired: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  sessionExpired: false,
  setAuth: (user, token, refreshToken) => {
    set({ user, token, sessionExpired: false });
    setToken(token);
    if (refreshToken) setRefreshToken(refreshToken);
  },
  updateUser: (user) => {
    set({ user });
  },
  logout: () => {
    clearToken();
    clearRefreshToken();
    set({ user: null, token: null, sessionExpired: false });
  },
  setSessionExpired: (value: boolean) => {
    set({ sessionExpired: value });
  },
}));
