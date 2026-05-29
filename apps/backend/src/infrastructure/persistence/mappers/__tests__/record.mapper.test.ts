import { describe, it, expect } from "vitest";
import { RecordMapper } from "../record.mapper";

describe("RecordMapper", () => {
  const baseRecord = {
    id: "record-1",
    workerId: "worker-1",
    date: new Date("2026-01-15"),
    hours: 8,
    hourlyRate: 25,
    description: "Cleaning",
    weekId: "week-1",
    createdAt: new Date("2026-01-15"),
  };

  describe("toDomain", () => {
    it("maps id", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.id).toBe("record-1");
    });

    it("maps workerId", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.workerId).toBe("worker-1");
    });

    it("maps date as Date object", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.date).toBe(baseRecord.date);
    });

    it("maps hours", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.hours).toBe(8);
    });

    it("maps hourlyRate", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.hourlyRate).toBe(25);
    });

    it("maps description as string", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.description).toBe("Cleaning");
    });

    it("maps null description", () => {
      const record = { ...baseRecord, description: null };
      const result = RecordMapper.toDomain(record);
      expect(result.description).toBeNull();
    });

    it("maps weekId", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.weekId).toBe("week-1");
    });

    it("maps createdAt", () => {
      const result = RecordMapper.toDomain(baseRecord);
      expect(result.createdAt).toBe(baseRecord.createdAt);
    });
  });

  describe("toDomainWithWorker", () => {
    const fullRecord = {
      ...baseRecord,
      worker: { id: "worker-1", name: "John Doe" },
      week: {
        id: "week-1",
        label: "2026-W03",
        startDate: new Date("2026-01-13"),
        endDate: new Date("2026-01-19"),
        status: "draft",
      },
    };

    it("maps all base fields", () => {
      const result = RecordMapper.toDomainWithWorker(fullRecord);
      expect(result.id).toBe("record-1");
      expect(result.workerId).toBe("worker-1");
      expect(result.hours).toBe(8);
    });

    it("maps worker with id and name", () => {
      const result = RecordMapper.toDomainWithWorker(fullRecord);
      expect(result.worker).toEqual({ id: "worker-1", name: "John Doe" });
    });

    it("maps week with all fields", () => {
      const result = RecordMapper.toDomainWithWorker(fullRecord);
      expect(result.week).toEqual({
        id: "week-1",
        label: "2026-W03",
        startDate: new Date("2026-01-13"),
        endDate: new Date("2026-01-19"),
        status: "draft",
      });
    });

    it("includes createdAt from base record", () => {
      const result = RecordMapper.toDomainWithWorker(fullRecord);
      expect(result.createdAt).toBe(baseRecord.createdAt);
    });
  });
});
