import { describe, it, expect } from "vitest";
import { WeekError } from "../week.error";

describe("WeekError", () => {
  it("has statusCode 400", () => {
    const error = new WeekError("test message");
    expect(error.statusCode).toBe(400);
  });

  it("has name WeekError", () => {
    const error = new WeekError("test message");
    expect(error.name).toBe("WeekError");
  });

  it("stores the message", () => {
    const error = new WeekError("Week not found");
    expect(error.message).toBe("Week not found");
  });

  it("is an instance of Error", () => {
    const error = new WeekError("test");
    expect(error instanceof Error).toBe(true);
  });
});
