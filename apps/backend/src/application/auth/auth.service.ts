import type { AuthPort } from "../../infrastructure/auth/auth.port.js";

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: { id: string; email: string };
}

export class AuthApplicationService {
  private readonly masterId = "00000000-0000-0000-0000-000000000001";

  constructor(
    private readonly authPort: AuthPort
  ) {}

  async login(input: LoginInput): Promise<AuthResult> {
    const valid = await this.authPort.validateCredentials(
      input.email,
      input.password
    );

    if (!valid) {
      throw new AuthError("Invalid credentials");
    }

    const user = { id: this.masterId, email: input.email };
    const token = this.authPort.generateToken(user);

    return { token, user };
  }

  verifyToken(token: string): AuthUser {
    try {
      return this.authPort.verifyToken(token);
    } catch {
      throw new AuthError("Invalid token");
    }
  }
}

export interface AuthUser {
  id: string;
  email: string;
}

export class AuthError extends Error {
  statusCode = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
