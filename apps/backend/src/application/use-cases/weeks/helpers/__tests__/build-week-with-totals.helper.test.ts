import { describe, it, expect } from "vitest";
import { BuildWeekWithTotalsHelper } from "../build-week-with-totals.helper";
import type { Week } from "../../../../../domain/entities/week.entity";
import type { RecordWithWorker } from "../../../../../domain/ports/record.repository";
import type { WorkerPayment } from "../../../../../domain/entities/worker-payment.entity";

function makeWeek(overrides?: Partial<Week>): Week {
  return {
    id: "week-1",
    label: "Semana 23 · may 30 - jun 5",
    startDate: new Date("2026-05-30"),
    endDate: new Date("2026-06-05"),
    status: "draft",
    createdAt: new Date("2026-05-29"),
    ...overrides,
  };
}

function makeRecord(overrides?: Partial<RecordWithWorker>): RecordWithWorker {
  return {
    id: "record-1",
    workerId: "worker-1",
    date: new Date("2026-05-30"),
    hours: 8,
    hourlyRate: 25,
    description: "Cleaning",
    weekId: "week-1",
    daySavedAt: null,
    createdAt: new Date("2026-05-30"),
    worker: { id: "worker-1", name: "Alice" },
    week: { id: "week-1", label: "W23", startDate: new Date("2026-05-30"), endDate: new Date("2026-06-05"), status: "draft" },
    ...overrides,
  } as RecordWithWorker;
}

const mockWeekCalc = {
  formatDate: (d: Date) => d.toISOString().slice(0, 10),
};

const mockTotalsCalc = {
  recordTotal: (h: number, r: number) => h * r,
  totalsByWorker: (records: any[], names: Map<string, string>) => {
    const map = new Map<string, { totalHours: number; totalAmount: number }>();
    for (const r of records) {
      const e = map.get(r.workerId) || { totalHours: 0, totalAmount: 0 };
      map.set(r.workerId, { totalHours: e.totalHours + r.hours, totalAmount: e.totalAmount + r.hours * r.hourlyRate });
    }
    return Array.from(map.entries()).map(([id, t]) => ({ workerId: id, workerName: names.get(id) || "", totalHours: t.totalHours, totalAmount: t.totalAmount }));
  },
  grandTotal: (totals: any[]) => totals.reduce((s, w) => s + w.totalAmount, 0),
};

describe("BuildWeekWithTotalsHelper", () => {
  it("returns empty records and zero grandTotal when given empty records array", () => {
    const week = makeWeek();
    const result = BuildWeekWithTotalsHelper.execute(week, [], mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.records).toEqual([]);
    expect(result.totalsByWorker).toEqual([]);
    expect(result.grandTotal).toBe(0);
  });

  it("formats week id, label, startDate, endDate, and createdAt", () => {
    const week = makeWeek({ id: "week-x", label: "Semana 1 · ene 1 - ene 7", status: "saved" });
    const result = BuildWeekWithTotalsHelper.execute(week, [], mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.id).toBe("week-x");
    expect(result.label).toBe("Semana 1 · ene 1 - ene 7");
    expect(result.startDate).toBe("2026-05-30");
    expect(result.endDate).toBe("2026-06-05");
    expect(result.status).toBe("saved");
    expect(result.createdAt).toBe(week.createdAt);
  });

  it("maps workerName from record.worker.name into formattedRecords", () => {
    const record = makeRecord({ worker: { id: "w1", name: "Bob" } });
    const result = BuildWeekWithTotalsHelper.execute(makeWeek(), [record], mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.records[0].workerName).toBe("Bob");
    expect(result.records[0].hours).toBe(8);
    expect(result.records[0].hourlyRate).toBe(25);
    expect(result.records[0].total).toBe(200);
  });

  it("aggregates multiple records for same worker in totalsByWorker", () => {
    const records = [
      makeRecord({ id: "r1", hours: 4, hourlyRate: 20 }),
      makeRecord({ id: "r2", hours: 6, hourlyRate: 20 }),
    ];
    const result = BuildWeekWithTotalsHelper.execute(makeWeek(), records, mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.totalsByWorker).toHaveLength(1);
    expect(result.totalsByWorker[0].totalHours).toBe(10);
    expect(result.totalsByWorker[0].totalAmount).toBe(200);
  });

  it("separates totalsByWorker for different workers", () => {
    const records = [
      makeRecord({ id: "r1", workerId: "w1", worker: { id: "w1", name: "Alice" } }),
      makeRecord({ id: "r2", workerId: "w2", worker: { id: "w2", name: "Bob" } }),
    ];
    const result = BuildWeekWithTotalsHelper.execute(makeWeek(), records, mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.totalsByWorker).toHaveLength(2);
  });

  it("maps payments to {workerId, paidAt ISO string}", () => {
    const week = makeWeek();
    const payments: WorkerPayment[] = [
      { id: "p1", workerId: "w1", weekIds: ["week-1"], amount: 100, paidAt: new Date("2026-06-01T10:00:00Z") },
    ];
    const result = BuildWeekWithTotalsHelper.execute(week, [], mockWeekCalc as any, mockTotalsCalc as any, payments);
    expect(result.payments).toHaveLength(1);
    expect(result.payments[0]).toEqual({ workerId: "w1", paidAt: "2026-06-01T10:00:00.000Z" });
  });

  it("returns empty payments array when no payments provided", () => {
    const result = BuildWeekWithTotalsHelper.execute(makeWeek(), [], mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.payments).toEqual([]);
  });

  it("preserves draft status", () => {
    const week = makeWeek({ status: "draft" });
    const result = BuildWeekWithTotalsHelper.execute(week, [], mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.status).toBe("draft");
  });

  it("preserves saved status", () => {
    const week = makeWeek({ status: "saved" });
    const result = BuildWeekWithTotalsHelper.execute(week, [], mockWeekCalc as any, mockTotalsCalc as any, []);
    expect(result.status).toBe("saved");
  });
});