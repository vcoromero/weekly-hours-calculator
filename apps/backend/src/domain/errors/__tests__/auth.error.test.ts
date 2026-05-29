import { describe, it, expect } from "vitest";
import { AuthError } from "../auth.error";

describe("AuthError", () => {
  it("has statusCode 401", () => {
    const error = new AuthError("test message");
    expect(error.statusCode).toBe(401);
  });

  it("has name AuthError", () => {
    const error = new AuthError("test message");
    expect(error.name).toBe("AuthError");
  });

  it("stores the message", () => {
    const error = new AuthError("Invalid credentials");
    expect(error.message).toBe("Invalid credentials");
  });

  it("is an instance of Error", () => {
    const error = new AuthError("test");
    expect(error instanceof Error).toBe(true);
  });
});
