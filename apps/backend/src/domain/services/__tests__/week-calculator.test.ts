import { describe, it, expect, beforeEach } from "vitest";
import { WeekCalculator } from "../week-calculator.js";

describe("WeekCalculator", () => {
  let calculator: WeekCalculator;

  beforeEach(() => {
    calculator = new WeekCalculator();
  });

  describe("getWeekNumber", () => {
    it("returns week 1 for January 1 when it falls on Monday", () => {
      const mondayJan1 = new Date("2024-01-01T12:00:00Z");
      expect(calculator.getWeekNumber(mondayJan1)).toBe(1);
    });

    it("returns correct week for mid-year Monday", () => {
      const julyMonday = new Date("2026-07-06T12:00:00Z");
      expect(calculator.getWeekNumber(julyMonday)).toBe(28);
    });

    it("returns correct week for a Sunday", () => {
      const sunday = new Date("2026-07-12T12:00:00Z");
      expect(calculator.getWeekNumber(sunday)).toBe(28);
    });

    it("handles leap year date February 29, 2024", () => {
      const leapDay = new Date("2024-02-29T12:00:00Z");
      expect(calculator.getWeekNumber(leapDay)).toBe(9);
    });

    it("handles date on year boundary correctly", () => {
      const boundary = new Date("2025-12-29T12:00:00Z");
      expect(calculator.getWeekNumber(boundary)).toBe(1);
    });

    it("returns week 53 for December 31 when appropriate", () => {
      const dec31 = new Date("2026-12-31T12:00:00Z");
      expect(calculator.getWeekNumber(dec31)).toBe(53);
    });
  });

  describe("getWeekForDate", () => {
    it("returns Monday (day 1) as start for a Wednesday input", () => {
      const result = calculator.getWeekForDate("2026-07-08");
      expect(result.start.getDay()).toBe(1);
    });

    it("returns Sunday (day 0) as end for a Wednesday input", () => {
      const result = calculator.getWeekForDate("2026-07-08");
      expect(result.end.getDay()).toBe(0);
    });

    it("start date has time 00:00:00.000", () => {
      const result = calculator.getWeekForDate("2026-07-08");
      expect(result.start.getHours()).toBe(0);
      expect(result.start.getMinutes()).toBe(0);
      expect(result.start.getSeconds()).toBe(0);
      expect(result.start.getMilliseconds()).toBe(0);
    });

    it("end date has time 23:59:59.999", () => {
      const result = calculator.getWeekForDate("2026-07-08");
      expect(result.end.getHours()).toBe(23);
      expect(result.end.getMinutes()).toBe(59);
      expect(result.end.getSeconds()).toBe(59);
      expect(result.end.getMilliseconds()).toBe(999);
    });

    it("label format matches expected pattern", () => {
      const result = calculator.getWeekForDate("2026-07-08");
      expect(result.label).toMatch(/^Semana \d+ · .+ - .+$/);
    });

    it("Sunday input returns the Sunday's own week Monday-Sunday", () => {
      const result = calculator.getWeekForDate("2026-07-12");
      expect(result.start.getDay()).toBe(1);
      expect(result.end.getDay()).toBe(0);
    });

    it("Jan 1 boundary falls in a valid Monday-Sunday week", () => {
      const result = calculator.getWeekForDate("2026-01-01");
      expect(result.start.getDay()).toBe(1);
      expect(result.end.getDay()).toBe(0);
      expect(result.start <= result.end).toBe(true);
    });

    it("start and end are Monday-Sunday of the same week", () => {
      const result = calculator.getWeekForDate("2026-07-08");
      expect(result.start.getDay()).toBe(1);
      expect(result.end.getDay()).toBe(0);
      expect(result.start < result.end).toBe(true);
    });
  });

  describe("formatDate", () => {
    it("returns YYYY-MM-DD string", () => {
      const date = new Date("2026-07-08T12:00:00Z");
      expect(calculator.formatDate(date)).toBe("2026-07-08");
    });

    it("pads single-digit month with zero", () => {
      const date = new Date("2026-01-05T12:00:00Z");
      expect(calculator.formatDate(date)).toBe("2026-01-05");
    });

    it("pads single-digit day with zero", () => {
      const date = new Date("2026-07-08T12:00:00Z");
      expect(calculator.formatDate(date)).toBe("2026-07-08");
    });
  });

  describe("getPreviousWeek", () => {
    it("returns a Monday-Sunday week", () => {
      const result = calculator.getPreviousWeek();
      expect(result.start.getDay()).toBe(1);
      expect(result.end.getDay()).toBe(0);
    });

    it("label contains a week number", () => {
      const result = calculator.getPreviousWeek();
      expect(result.label).toMatch(/^Semana \d+ ·/);
    });

    it("start date is before end date", () => {
      const result = calculator.getPreviousWeek();
      expect(result.start < result.end).toBe(true);
    });

    it("start and end form a Monday-Sunday pair", () => {
      const result = calculator.getPreviousWeek();
      expect(result.start.getDay()).toBe(1);
      expect(result.end.getDay()).toBe(0);
    });
  });
});
