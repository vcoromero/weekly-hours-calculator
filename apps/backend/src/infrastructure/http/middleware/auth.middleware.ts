import { Request, Response, NextFunction } from "express";
import type { AuthUser } from "../../../domain/value-objects/auth-user.vo.js";
import type { VerifyTokenUseCase } from "../../../application/use-cases/auth/verify-token.use-case.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function createAuthMiddleware(verifyTokenUseCase: VerifyTokenUseCase) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      req.user = verifyTokenUseCase.execute(token);
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };
}
