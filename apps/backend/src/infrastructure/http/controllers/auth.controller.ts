import { Request, Response } from "express";
import type { AuthApplicationService } from "../../../application/auth/auth.service.js";

export function createAuthController(authService: AuthApplicationService) {
  return {
    async login(req: Request, res: Response) {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    },
  };
}
