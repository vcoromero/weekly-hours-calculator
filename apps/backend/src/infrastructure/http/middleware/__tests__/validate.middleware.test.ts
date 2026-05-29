import { describe, it, expect, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validateBody, validateParams } from "../validate.middleware";

function createMocks() {
  const req = {} as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

const testSchema = z.object({
  name: z.string(),
  age: z.number(),
});

describe("validateBody", () => {
  it("calls next when body is valid", () => {
    const middleware = validateBody(testSchema);
    const { req, res, next } = createMocks();
    req.body = { name: "John", age: 30 };

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ name: "John", age: 30 });
  });

  it("returns 400 when body is invalid", () => {
    const middleware = validateBody(testSchema);
    const { req, res, next } = createMocks();
    req.body = { name: "John" };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation error" })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ details: expect.any(Array) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 400 when body is empty and required", () => {
    const requiredSchema = z.object({ name: z.string().min(1) });
    const middleware = validateBody(requiredSchema);
    const { req, res, next } = createMocks();
    req.body = {};

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation error" })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("parses and replaces body with parsed data", () => {
    const withTransform = z.object({ count: z.string().transform((s) => parseInt(s, 10)) });
    const middleware = validateBody(withTransform);
    const { req, res, next } = createMocks();
    req.body = { count: "42" };

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ count: 42 });
  });
});

describe("validateParams", () => {
  it("calls next when params are valid", () => {
    const paramsSchema = z.object({ id: z.string() });
    const middleware = validateParams(paramsSchema);
    const { req, res, next } = createMocks();
    req.params = { id: "123" };

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("returns 400 when params are invalid", () => {
    const paramsSchema = z.object({ id: z.string().uuid() });
    const middleware = validateParams(paramsSchema);
    const { req, res, next } = createMocks();
    req.params = { id: "not-a-uuid" };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Validation error" })
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ details: expect.any(Array) })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
