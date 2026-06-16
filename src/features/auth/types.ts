// Feature-level auth types — re-exports from shared types + feature-specific additions

export { type User, type LoginCredentials, type RegisterCredentials, type AuthResponse } from "../../types/auth.types";

export interface MfaChallenge {
  method: "sms" | "authenticator";
  sessionId: string;
}

export interface MfaVerifyPayload {
  code: string;
  sessionId: string;
}

export interface ProfileSetupPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  nationality: string;
}
