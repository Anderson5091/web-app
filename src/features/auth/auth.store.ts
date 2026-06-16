import { create } from "zustand";
import { setToken, clearToken } from "../../utils/token";
import type { User } from "../../types/auth.types";

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => {
    set({ user, token });
    setToken(token);
  },
  updateUser: (user) => {
    set({ user });
  },
  logout: () => {
    clearToken();
    set({ user: null, token: null });
  },
}));
