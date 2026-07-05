import { create } from "zustand";
import { setToken, clearToken, setRefreshToken, clearRefreshToken } from "../../utils/token";
import { authApi } from "../../api/auth.api";
import type { User } from "../../types/auth.types";

type AuthState = {
  user: User | null;
  token: string | null;
  sessionExpired: boolean;
  profileLoading: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (user: User) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { fullName?: string; phone?: string; country?: string }) => Promise<User>;
  logout: () => void;
  setSessionExpired: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  sessionExpired: false,
  profileLoading: false,

  setAuth: (user, token, refreshToken) => {
    set({ user, token, sessionExpired: false });
    setToken(token);
    if (refreshToken) setRefreshToken(refreshToken);
  },

  updateUser: (user) => {
    set({ user });
  },

  fetchProfile: async () => {
    try {
      set({ profileLoading: true });
      const { data } = await authApi.me();
      set({ user: data, profileLoading: false });
    } catch {
      set({ profileLoading: false });
    }
  },

  updateProfile: async (payload) => {
    const { data } = await authApi.updateProfile(payload);
    set({ user: data });
    return data;
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
