export interface User {
  id?: number;
  email: string;
  name?: string;
  kycTier?: 0 | 1 | 2 | 3;
  kycStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterCredentials {
  email: string;
  phone?: string;
  fullName?: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
