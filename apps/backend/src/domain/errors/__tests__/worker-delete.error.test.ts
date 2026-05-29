import { describe, it, expect } from "vitest";
import { WorkerDeleteError } from "../worker-delete.error";

describe("WorkerDeleteError", () => {
  it("has statusCode 400", () => {
    const error = new WorkerDeleteError("test message");
    expect(error.statusCode).toBe(400);
  });

  it("has name WorkerDeleteError", () => {
    const error = new WorkerDeleteError("test message");
    expect(error.name).toBe("WorkerDeleteError");
  });

  it("stores the message", () => {
    const error = new WorkerDeleteError("Worker has associated records");
    expect(error.message).toBe("Worker has associated records");
  });

  it("is an instance of Error", () => {
    const error = new WorkerDeleteError("test");
    expect(error instanceof Error).toBe(true);
  });
});
