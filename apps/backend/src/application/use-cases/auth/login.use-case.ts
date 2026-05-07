import type { AuthPort } from "../../../domain/ports/auth.port.js";
import { AuthError } from "../../../domain/errors/auth.error.js";
import type { LoginInputDto } from "../../dto/auth/login-input.dto.js";
import type { AuthResultDto } from "../../dto/auth/auth-result.dto.js";

export class LoginUseCase {
  private readonly masterId = "00000000-0000-0000-0000-000000000001";

  constructor(private readonly authPort: AuthPort) {}

  async execute(input: LoginInputDto): Promise<AuthResultDto> {
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
}
