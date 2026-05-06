import { Request, Response, NextFunction } from "express";
import type { AuthApplicationService, AuthUser } from "../../../application/auth/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function createAuthMiddleware(authService: AuthApplicationService) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      req.user = authService.verifyToken(token);
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  };
}
