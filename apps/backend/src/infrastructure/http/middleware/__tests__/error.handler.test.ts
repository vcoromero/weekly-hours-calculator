import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../error.handler";
import { AuthError } from "../../../../domain/errors/auth.error";
import { RecordError } from "../../../../domain/errors/record.error";

function createMocks() {
  const req = {} as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const next = vi.fn();
  return { req, res, next };
}

describe("errorHandler", () => {
  it("returns 400 for ZodError", () => {
    const ZodError = require("zod").ZodError;
    const { req, res, next } = createMocks();
    const zodError = new ZodError([]);

    errorHandler(zodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation error" })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ details: expect.any(Array) })
    );
  });

  it("returns custom statusCode for error with statusCode property", () => {
    const { req, res, next } = createMocks();
    const customError = new AuthError("Forbidden");
    customError.statusCode = 403;

    errorHandler(customError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
  });

  it("returns 400 for RecordError", () => {
    const { req, res, next } = createMocks();
    const recordError = new RecordError("Cannot delete paid record");

    errorHandler(recordError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Cannot delete paid record" });
  });

  it("returns 500 for unknown errors without statusCode", () => {
    const { req, res, next } = createMocks();
    const unknownError = new Error("Something went wrong");

    errorHandler(unknownError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});
