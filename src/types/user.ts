export type UserRole = "ADMIN" | "CUSTOMER" | "MECHANIC";

export interface MechanicProfile {
  id: string;
  status: string;
  businessName: string;
  isVerified: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  mechanicProfile?: MechanicProfile;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
