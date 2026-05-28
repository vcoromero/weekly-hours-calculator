import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { AuthPort } from "../../domain/ports/auth.port.js";
import type { AuthUser } from "../../domain/value-objects/auth-user.vo.js";
import { env } from "../../config/env.js";

export class JwtBcryptAuthAdapter implements AuthPort {
  async validateCredentials(email: string, password: string): Promise<boolean> {
    if (email.toLowerCase() !== env.MASTER_EMAIL.toLowerCase()) return false;
    try {
      return await bcrypt.compare(password, env.MASTER_PASSWORD_HASH);
    } catch (err) {
      console.error("[auth] bcrypt.compare failed:", err);
      return false;
    }
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
