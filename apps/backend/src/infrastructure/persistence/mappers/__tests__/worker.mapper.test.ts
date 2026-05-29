import { describe, it, expect } from "vitest";
import { WorkerMapper } from "../worker.mapper";

describe("WorkerMapper", () => {
  it("maps id", () => {
    const prismaWorker = {
      id: "worker-1",
      name: "John Doe",
      isRegular: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    };
    const result = WorkerMapper.toDomain(prismaWorker);
    expect(result.id).toBe("worker-1");
  });

  it("maps name", () => {
    const prismaWorker = {
      id: "worker-1",
      name: "John Doe",
      isRegular: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    };
    const result = WorkerMapper.toDomain(prismaWorker);
    expect(result.name).toBe("John Doe");
  });

  it("maps isRegular as true", () => {
    const prismaWorker = {
      id: "worker-1",
      name: "John Doe",
      isRegular: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    };
    const result = WorkerMapper.toDomain(prismaWorker);
    expect(result.isRegular).toBe(true);
  });

  it("maps isRegular as false for occasional workers", () => {
    const prismaWorker = {
      id: "worker-2",
      name: "Jane Doe",
      isRegular: false,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
    };
    const result = WorkerMapper.toDomain(prismaWorker);
    expect(result.isRegular).toBe(false);
  });

  it("maps createdAt as Date object", () => {
    const createdAt = new Date("2026-01-01");
    const prismaWorker = {
      id: "worker-1",
      name: "John Doe",
      isRegular: true,
      createdAt,
      updatedAt: new Date("2026-01-02"),
    };
    const result = WorkerMapper.toDomain(prismaWorker);
    expect(result.createdAt).toBe(createdAt);
  });

  it("maps updatedAt as Date object", () => {
    const updatedAt = new Date("2026-01-02");
    const prismaWorker = {
      id: "worker-1",
      name: "John Doe",
      isRegular: true,
      createdAt: new Date("2026-01-01"),
      updatedAt,
    };
    const result = WorkerMapper.toDomain(prismaWorker);
    expect(result.updatedAt).toBe(updatedAt);
  });
});
