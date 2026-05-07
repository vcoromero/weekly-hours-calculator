import type { AuthUser } from "../value-objects/auth-user.vo.js";

export interface AuthPort {
  validateCredentials(email: string, password: string): Promise<boolean>;
  generateToken(user: AuthUser): string;
  verifyToken(token: string): AuthUser;
}
