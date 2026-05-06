import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { AuthPort } from "./auth.port.js";
import type { AuthUser } from "../../application/auth/auth.service.js";
import { env } from "../../config/env.js";

export class JwtBcryptAuthAdapter implements AuthPort {
  async validateCredentials(email: string, password: string): Promise<boolean> {
    if (email !== env.MASTER_EMAIL) return false;
    return bcrypt.compare(password, env.MASTER_PASSWORD_HASH);
  }

  generateToken(user: AuthUser): string {
    const expiresIn = env.JWT_EXPIRES_IN as string | number;
    return jwt.sign(
      { id: user.id, email: user.email },
      env.JWT_SECRET,
      { expiresIn } as jwt.SignOptions
    );
  }

  verifyToken(token: string): AuthUser {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
    };
    return { id: decoded.id, email: decoded.email };
  }
}
