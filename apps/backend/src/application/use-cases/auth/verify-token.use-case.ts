import type { AuthPort } from "../../../domain/ports/auth.port.js";
import type { AuthUser } from "../../../domain/value-objects/auth-user.vo.js";
import { AuthError } from "../../../domain/errors/auth.error.js";

export class VerifyTokenUseCase {
  constructor(private readonly authPort: AuthPort) {}

  execute(token: string): AuthUser {
    try {
      return this.authPort.verifyToken(token);
    } catch {
      throw new AuthError("Invalid token");
    }
  }
}
