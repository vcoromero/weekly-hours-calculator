import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatDateShort, formatDateWithYear, formatHours } from "../formatters.ts";

describe("formatCurrency", () => {
  it("formats integer", () => {
    const result = formatCurrency(120);
    expect(result).toMatch(/120.*US\$/);
    expect(result).toMatch(/,\d{2}/);
  });

  it("formats decimal", () => {
    const result = formatCurrency(120.5);
    expect(result).toMatch(/120,50.*US\$/);
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toMatch(/0.*US\$/);
  });

  it("formats large number with thousands separator", () => {
    const result = formatCurrency(1500);
    expect(result).toMatch(/1\.?500.*US\$/);
  });
});

describe("formatDate", () => {
  it("formats date string with weekday short + month short + day", () => {
    const result = formatDate("2026-07-08");
    expect(result).toMatch(/^.+, \d+ .+$/);
  });

  it("produces different strings for different dates", () => {
    const result1 = formatDate("2026-01-05");
    const result2 = formatDate("2026-12-25");
    expect(result1).not.toBe(result2);
  });
});

describe("formatDateShort", () => {
  it("formats month short + day", () => {
    const result = formatDateShort("2026-07-08");
    expect(result).toMatch(/^\d+ .+$/);
  });

  it("produces different strings for different dates", () => {
    const result1 = formatDateShort("2026-07-08");
    const result2 = formatDateShort("2026-12-25");
    expect(result1).not.toBe(result2);
  });
});

describe("formatDateWithYear", () => {
  it("formats day + month short + year", () => {
    const result = formatDateWithYear("2026-07-08");
    expect(result).toMatch(/^\d+ .+ \d{4}$/);
  });
});

describe("formatHours", () => {
  it("integer hours returns no decimals", () => {
    expect(formatHours(8)).toBe("8");
  });

  it("decimal hours returns one decimal", () => {
    expect(formatHours(7.5)).toBe("7.5");
  });

  it("zero returns '0'", () => {
    expect(formatHours(0)).toBe("0");
  });

  it("trailing zero decimal trimmed", () => {
    expect(formatHours(8.0)).toBe("8");
  });
});
