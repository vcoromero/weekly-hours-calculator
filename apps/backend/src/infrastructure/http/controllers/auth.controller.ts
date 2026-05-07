import { Request, Response } from "express";
import type { LoginUseCase } from "../../../application/use-cases/auth/login.use-case.js";

interface AuthControllerDeps {
  login: LoginUseCase;
}

export function createAuthController(deps: AuthControllerDeps) {
  return {
    async login(req: Request, res: Response) {
      const result = await deps.login.execute(req.body);
      res.status(200).json(result);
    },
  };
}
