import { describe, it, expect } from "vitest";
import { recordTotal, totalsByWorker, grandTotal } from "../calculations.ts";

describe("recordTotal", () => {
  it("basic multiplication", () => {
    expect(recordTotal(8, 15)).toBe(120);
  });

  it("rounds to 2 decimals", () => {
    expect(recordTotal(7.5, 15.25)).toBe(114.38);
  });

  it("zero hours returns zero", () => {
    expect(recordTotal(0, 15)).toBe(0);
  });

  it("zero rate returns zero", () => {
    expect(recordTotal(8, 0)).toBe(0);
  });
});

describe("totalsByWorker", () => {
  const workers = [
    { id: "w1", name: "Alice" },
    { id: "w2", name: "\u0411\u043e\u0431" },
  ];

  it("empty records returns empty array", () => {
    expect(totalsByWorker([], workers)).toEqual([]);
  });

  it("groups by workerId and sums hours and amount", () => {
    const records = [
      { workerId: "w1", workerName: "Alice", hours: 8, hourlyRate: 15 },
      { workerId: "w1", workerName: "Alice", hours: 4, hourlyRate: 15 },
      { workerId: "w2", workerName: "\u0411\u043e\u0431", hours: 6, hourlyRate: 20 },
    ];
    const result = totalsByWorker(records, workers);
    expect(result).toHaveLength(2);
    const alice = result.find((w) => w.workerId === "w1")!;
    const bob = result.find((w) => w.workerId === "w2")!;
    expect(alice.totalHours).toBe(12);
    expect(alice.totalAmount).toBe(180);
    expect(bob.totalAmount).toBe(120);
  });

  it("falls back to workerName from record when map missing", () => {
    const records = [{ workerId: "w3", workerName: "Carol", hours: 8, hourlyRate: 15 }];
    const result = totalsByWorker(records, []);
    expect(result[0].workerName).toBe("Carol");
  });

  it("falls back to Unknown when neither has name", () => {
    const records = [{ workerId: "w3", workerName: "", hours: 8, hourlyRate: 15 }];
    const result = totalsByWorker(records, []);
    expect(result[0].workerName).toBe("Unknown");
  });
});

describe("grandTotal", () => {
  it("empty returns 0", () => {
    expect(grandTotal([])).toBe(0);
  });

  it("sums single worker total", () => {
    const totals = [{ workerId: "w1", workerName: "Alice", totalHours: 40, totalAmount: 600 }];
    expect(grandTotal(totals)).toBe(600);
  });

  it("sums multiple workers", () => {
    const totals = [
      { workerId: "w1", workerName: "Alice", totalHours: 40, totalAmount: 600 },
      { workerId: "w2", workerName: "Bob", totalHours: 20, totalAmount: 400 },
    ];
    expect(grandTotal(totals)).toBe(1000);
  });
});
