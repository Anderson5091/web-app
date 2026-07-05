export interface User {
  id?: number;
  email: string;
  fullName?: string;
  phone?: string;
  phoneVerified?: boolean;
  country?: string;
  createdAt?: string;
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
