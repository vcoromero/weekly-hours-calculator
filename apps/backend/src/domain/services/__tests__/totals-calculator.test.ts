import { describe, it, expect, beforeEach } from "vitest";
import { TotalsCalculator } from "../totals-calculator.js";
import type { WorkerTotal } from "../../entities/week.entity.js";

describe("TotalsCalculator", () => {
  let calculator: TotalsCalculator;

  beforeEach(() => {
    calculator = new TotalsCalculator();
  });

  describe("recordTotal", () => {
    it("multiplies hours by rate", () => {
      expect(calculator.recordTotal(8, 15)).toBe(120);
    });

    it("rounds to 2 decimal places", () => {
      expect(calculator.recordTotal(7.5, 15.25)).toBe(114.38);
    });

    it("handles zero hours", () => {
      expect(calculator.recordTotal(0, 15)).toBe(0);
    });

    it("handles zero rate", () => {
      expect(calculator.recordTotal(8, 0)).toBe(0);
    });

    it("preserves precision for clean numbers", () => {
      expect(calculator.recordTotal(10, 20.5)).toBe(205);
    });
  });

  describe("totalsByWorker", () => {
    it("returns empty array for empty records", () => {
      const result = calculator.totalsByWorker([], new Map());
      expect(result).toEqual([]);
    });

    it("single worker, single record returns correct totals", () => {
      const records = [{ workerId: "w1", hours: 8, hourlyRate: 15 }];
      const names = new Map([["w1", "Alice"]]);
      const result = calculator.totalsByWorker(records, names);
      expect(result).toEqual([
        { workerId: "w1", workerName: "Alice", totalHours: 8, totalAmount: 120 },
      ]);
    });

    it("single worker, multiple records sums correctly", () => {
      const records = [
        { workerId: "w1", hours: 8, hourlyRate: 15 },
        { workerId: "w1", hours: 4, hourlyRate: 15 },
      ];
      const names = new Map([["w1", "Alice"]]);
      const result = calculator.totalsByWorker(records, names);
      expect(result).toEqual([
        { workerId: "w1", workerName: "Alice", totalHours: 12, totalAmount: 180 },
      ]);
    });

    it("multiple workers groups by workerId correctly", () => {
      const records = [
        { workerId: "w1", hours: 8, hourlyRate: 15 },
        { workerId: "w2", hours: 6, hourlyRate: 20 },
      ];
      const names = new Map([
        ["w1", "Alice"],
        ["w2", "Bob"],
      ]);
      const result = calculator.totalsByWorker(records, names);
      expect(result).toHaveLength(2);
      expect(result.find((w) => w.workerId === "w1")?.totalAmount).toBe(120);
      expect(result.find((w) => w.workerId === "w2")?.totalAmount).toBe(120);
    });

    it("worker not found in names map returns Unknown", () => {
      const records = [{ workerId: "w1", hours: 8, hourlyRate: 15 }];
      const names = new Map();
      const result = calculator.totalsByWorker(records, names);
      expect(result[0].workerName).toBe("Unknown");
    });
  });

  describe("grandTotal", () => {
    it("returns 0 for empty array", () => {
      expect(calculator.grandTotal([])).toBe(0);
    });

    it("sums single worker total", () => {
      const totals = [
        { workerId: "w1", workerName: "Alice", totalHours: 40, totalAmount: 600 },
      ];
      expect(calculator.grandTotal(totals)).toBe(600);
    });

    it("sums multiple worker totals", () => {
      const totals = [
        { workerId: "w1", workerName: "Alice", totalHours: 40, totalAmount: 600 },
        { workerId: "w2", workerName: "Bob", totalHours: 20, totalAmount: 400 },
      ];
      expect(calculator.grandTotal(totals)).toBe(1000);
    });

    it("rounds to 2 decimal places", () => {
      const totals = [
        { workerId: "w1", workerName: "Alice", totalHours: 8, totalAmount: 114.375 },
        { workerId: "w2", workerName: "Bob", totalHours: 6, totalAmount: 114.375 },
      ];
      expect(calculator.grandTotal(totals)).toBe(228.75);
    });
  });
});
