import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation error",
      details: err.issues,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Resource already exists" });
      return;
    }
    if (err.code === "P2003") {
      res.status(400).json({ error: "Referenced resource not found" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Resource not found" });
      return;
    }
  }

  if (err.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
}
