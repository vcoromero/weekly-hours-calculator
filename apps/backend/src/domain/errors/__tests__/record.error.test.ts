import { describe, it, expect } from "vitest";
import { RecordError } from "../record.error";

describe("RecordError", () => {
  it("has statusCode 400", () => {
    const error = new RecordError("test message");
    expect(error.statusCode).toBe(400);
  });

  it("has name RecordError", () => {
    const error = new RecordError("test message");
    expect(error.name).toBe("RecordError");
  });

  it("stores the message", () => {
    const error = new RecordError("Duplicate record");
    expect(error.message).toBe("Duplicate record");
  });

  it("is an instance of Error", () => {
    const error = new RecordError("test");
    expect(error instanceof Error).toBe(true);
  });
});
