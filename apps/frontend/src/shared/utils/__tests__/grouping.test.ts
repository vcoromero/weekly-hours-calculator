import { describe, it, expect } from "vitest";
import { groupRecordsByDate, groupByWorker } from "../grouping";
import type { WorkRecord, Week } from "@/shared/types";

describe("groupRecordsByDate", () => {
  it("empty array returns empty array", () => {
    expect(groupRecordsByDate([])).toEqual([]);
  });

  it("single record returns 1 group with correct dayTotal", () => {
    const records: WorkRecord[] = [
      { id: "1", workerId: "w1", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 25, total: 200 },
    ];
    const result = groupRecordsByDate(records);
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe("2026-05-25");
    expect(result[0].records).toHaveLength(1);
    expect(result[0].dayTotal).toBe(200);
  });

  it("multiple records same date returns 1 group, dayTotal is sum", () => {
    const records: WorkRecord[] = [
      { id: "1", workerId: "w1", workerName: "Alice", date: "2026-05-25", hours: 4, hourlyRate: 20, total: 80 },
      { id: "2", workerId: "w2", workerName: "Bob", date: "2026-05-25", hours: 6, hourlyRate: 30, total: 180 },
    ];
    const result = groupRecordsByDate(records);
    expect(result).toHaveLength(1);
    expect(result[0].dayTotal).toBe(260);
  });

  it("multiple dates returns correctly grouped and sorted", () => {
    const records: WorkRecord[] = [
      { id: "1", workerId: "w1", workerName: "Alice", date: "2026-05-27", hours: 8, hourlyRate: 20, total: 160 },
      { id: "2", workerId: "w1", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 20, total: 160 },
      { id: "3", workerId: "w2", workerName: "Bob", date: "2026-05-26", hours: 8, hourlyRate: 25, total: 200 },
    ];
    const result = groupRecordsByDate(records);
    expect(result).toHaveLength(3);
    expect(result[0].date).toBe("2026-05-25");
    expect(result[1].date).toBe("2026-05-26");
    expect(result[2].date).toBe("2026-05-27");
  });

  it("unsorted dates are output sorted by date ascending", () => {
    const records: WorkRecord[] = [
      { id: "1", workerId: "w1", workerName: "Alice", date: "2026-05-30", hours: 8, hourlyRate: 20, total: 160 },
      { id: "2", workerId: "w1", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 20, total: 160 },
    ];
    const result = groupRecordsByDate(records);
    expect(result[0].date).toBe("2026-05-25");
    expect(result[1].date).toBe("2026-05-30");
  });

  it("dates with mixed order produces stable grouping", () => {
    const records: WorkRecord[] = [
      { id: "1", workerId: "w1", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 20, total: 160 },
      { id: "2", workerId: "w1", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 20, total: 160 },
      { id: "3", workerId: "w2", workerName: "Bob", date: "2026-05-26", hours: 8, hourlyRate: 20, total: 160 },
    ];
    const result = groupRecordsByDate(records);
    expect(result).toHaveLength(2);
    expect(result[0].records).toHaveLength(2);
    expect(result[1].records).toHaveLength(1);
  });
});

describe("groupByWorker", () => {
  it("empty records returns empty array", () => {
    const week = { id: "w1", label: "W1", startDate: "2026-05-25", endDate: "2026-05-31", status: "draft" as const, records: [] };
    expect(groupByWorker(week)).toEqual([]);
  });

  it("single record returns 1 group", () => {
    const week = {
      id: "w1",
      label: "W1",
      startDate: "2026-05-25",
      endDate: "2026-05-31",
      status: "draft" as const,
      records: [{ id: "r1", workerId: "alice", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 25 }],
    };
    const result = groupByWorker(week);
    expect(result).toHaveLength(1);
    expect(result[0].workerName).toBe("Alice");
    expect(result[0].totalHours).toBe(8);
    expect(result[0].totalAmount).toBe(200);
  });

  it("multiple records same worker aggregates correctly", () => {
    const week = {
      id: "w1",
      label: "W1",
      startDate: "2026-05-25",
      endDate: "2026-05-31",
      status: "draft" as const,
      records: [
        { id: "r1", workerId: "alice", workerName: "Alice", date: "2026-05-25", hours: 4, hourlyRate: 20, total: 80 },
        { id: "r2", workerId: "alice", workerName: "Alice", date: "2026-05-26", hours: 8, hourlyRate: 20, total: 160 },
      ],
    };
    const result = groupByWorker(week);
    expect(result).toHaveLength(1);
    expect(result[0].totalHours).toBe(12);
    expect(result[0].totalAmount).toBe(240);
    expect(result[0].records).toHaveLength(2);
  });

  it("multiple workers returns separate groups per worker", () => {
    const week = {
      id: "w1",
      label: "W1",
      startDate: "2026-05-25",
      endDate: "2026-05-31",
      status: "draft" as const,
      records: [
        { id: "r1", workerId: "alice", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 25, total: 200 },
        { id: "r2", workerId: "bob", workerName: "Bob", date: "2026-05-25", hours: 6, hourlyRate: 30, total: 180 },
      ],
    };
    const result = groupByWorker(week);
    expect(result).toHaveLength(2);
  });

  it("uses record.total when available instead of hours * rate", () => {
    const week = {
      id: "w1",
      label: "W1",
      startDate: "2026-05-25",
      endDate: "2026-05-31",
      status: "draft" as const,
      records: [
        { id: "r1", workerId: "alice", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 25, total: 210 },
      ],
    };
    const result = groupByWorker(week);
    expect(result[0].totalAmount).toBe(210);
  });

  it("falls back to hours * hourlyRate when total is missing", () => {
    const week = {
      id: "w1",
      label: "W1",
      startDate: "2026-05-25",
      endDate: "2026-05-31",
      status: "draft" as const,
      records: [
        { id: "r1", workerId: "alice", workerName: "Alice", date: "2026-05-25", hours: 8, hourlyRate: 25, total: 0 },
      ],
    };
    const result = groupByWorker(week);
    expect(result[0].totalAmount).toBe(200);
  });
});
