import type { AuthUser } from "../../../domain/value-objects/auth-user.vo.js";

export interface AuthResultDto {
  token: string;
  user: AuthUser;
}
