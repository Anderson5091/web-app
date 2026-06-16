import { authApi } from "../../../api/auth.api";
import type { LoginCredentials, RegisterCredentials } from "../../../types/auth.types";

export const AuthService = {
  login: async (data: LoginCredentials) => {
    const res = await authApi.login(data);
    return res.data;
  },
  register: async (data: RegisterCredentials) => {
    const res = await authApi.register(data);
    return res.data;
  },
  me: async () => {
    const res = await authApi.me();
    return res.data;
  },
};
