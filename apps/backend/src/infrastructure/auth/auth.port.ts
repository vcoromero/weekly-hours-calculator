import type { AuthUser } from "../../application/auth/auth.service.js";

export interface AuthPort {
  validateCredentials(email: string, password: string): Promise<boolean>;
  generateToken(user: AuthUser): string;
  verifyToken(token: string): AuthUser;
}
