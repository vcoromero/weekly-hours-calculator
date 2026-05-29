import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { createAuthMiddleware } from "../auth.middleware";
import { AuthError } from "../../../../domain/errors/auth.error";

function createMocks() {
  const req = {
    headers: {},
  } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("auth middleware", () => {
  it("returns 401 when no Authorization header", () => {
    const verifyTokenUseCase = { execute: vi.fn() };
    const middleware = createAuthMiddleware(verifyTokenUseCase);
    const { req, res, next } = createMocks();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Authorization is not Bearer", () => {
    const verifyTokenUseCase = { execute: vi.fn() };
    const middleware = createAuthMiddleware(verifyTokenUseCase);
    const { req, res, next } = createMocks();
    req.headers = { authorization: "Basic abc123" };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when Bearer token is empty", () => {
    const verifyTokenUseCase = { execute: vi.fn().mockImplementation(() => { throw new AuthError("Invalid token"); }) };
    const middleware = createAuthMiddleware(verifyTokenUseCase);
    const { req, res, next } = createMocks();
    req.headers = { authorization: "Bearer " };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    const verifyTokenUseCase = { execute: vi.fn().mockImplementation(() => { throw new AuthError("Invalid token"); }) };
    const middleware = createAuthMiddleware(verifyTokenUseCase);
    const { req, res, next } = createMocks();
    req.headers = { authorization: "Bearer invalid-token" };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next and sets req.user when token is valid", () => {
    const authUser = { id: "user-1", email: "admin@example.com" };
    const verifyTokenUseCase = { execute: vi.fn().mockReturnValue(authUser) };
    const middleware = createAuthMiddleware(verifyTokenUseCase);
    const { req, res, next } = createMocks();
    req.headers = { authorization: "Bearer valid-token" };

    middleware(req, res, next);

    expect(verifyTokenUseCase.execute).toHaveBeenCalledWith("valid-token");
    expect((req as any).user).toEqual(authUser);
    expect(next).toHaveBeenCalled();
  });
});
