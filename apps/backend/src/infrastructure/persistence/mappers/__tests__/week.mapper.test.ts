import { describe, it, expect } from "vitest";
import { WeekMapper } from "../week.mapper";

describe("WeekMapper", () => {
  it("maps id", () => {
    const prismaWeek = {
      id: "week-1",
      label: "2026-W01",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-07"),
      status: "draft",
      createdAt: new Date("2026-01-01"),
    };
    const result = WeekMapper.toDomain(prismaWeek);
    expect(result.id).toBe("week-1");
  });

  it("maps label", () => {
    const prismaWeek = {
      id: "week-1",
      label: "2026-W05",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-07"),
      status: "draft",
      createdAt: new Date("2026-01-01"),
    };
    const result = WeekMapper.toDomain(prismaWeek);
    expect(result.label).toBe("2026-W05");
  });

  it("maps startDate as Date object", () => {
    const startDate = new Date("2026-01-01");
    const prismaWeek = {
      id: "week-1",
      label: "2026-W01",
      startDate,
      endDate: new Date("2026-01-07"),
      status: "draft",
      createdAt: new Date("2026-01-01"),
    };
    const result = WeekMapper.toDomain(prismaWeek);
    expect(result.startDate).toBe(startDate);
  });

  it("maps endDate as Date object", () => {
    const endDate = new Date("2026-01-07");
    const prismaWeek = {
      id: "week-1",
      label: "2026-W01",
      startDate: new Date("2026-01-01"),
      endDate,
      status: "draft",
      createdAt: new Date("2026-01-01"),
    };
    const result = WeekMapper.toDomain(prismaWeek);
    expect(result.endDate).toBe(endDate);
  });

  it("casts status 'draft' to draft", () => {
    const prismaWeek = {
      id: "week-1",
      label: "2026-W01",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-07"),
      status: "draft",
      createdAt: new Date("2026-01-01"),
    };
    const result = WeekMapper.toDomain(prismaWeek);
    expect(result.status).toBe("draft");
  });

  it("casts status 'saved' to saved", () => {
    const prismaWeek = {
      id: "week-1",
      label: "2026-W01",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-07"),
      status: "saved",
      createdAt: new Date("2026-01-01"),
    };
    const result = WeekMapper.toDomain(prismaWeek);
    expect(result.status).toBe("saved");
  });

  it("maps createdAt", () => {
    const createdAt = new Date("2026-01-01");
    const prismaWeek = {
      id: "week-1",
      label: "2026-W01",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-07"),
      status: "draft",
      createdAt,
    };
    const result = WeekMapper.toDomain(prismaWeek);
    expect(result.createdAt).toBe(createdAt);
  });
});
