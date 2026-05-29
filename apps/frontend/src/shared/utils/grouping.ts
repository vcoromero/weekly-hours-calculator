import type { WorkRecord, Week } from "@/shared/types";
import { recordTotal } from "./calculations.js";

export interface DateGroup {
  date: string;
  records: WorkRecord[];
  dayTotal: number;
}

export function groupRecordsByDate(records: WorkRecord[]): DateGroup[] {
  const map = records.reduce<Record<string, WorkRecord[]>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});
  return Object.entries(map)
    .map(([date, recs]) => ({
      date,
      records: recs,
      dayTotal: recs.reduce((sum, r) => sum + recordTotal(r.hours, r.hourlyRate), 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export interface WorkerGroup {
  workerId: string;
  workerName: string;
  records: NonNullable<Week["records"]>;
  totalHours: number;
  totalAmount: number;
}

export function groupByWorker(week: Week): WorkerGroup[] {
  const groups = new Map<string, WorkerGroup>();

  if (!week.records) return [];

  for (const record of week.records) {
    const existing = groups.get(record.workerId) || {
      workerId: record.workerId,
      workerName: record.workerName || "Unknown",
      records: [],
      totalHours: 0,
      totalAmount: 0,
    };
    existing.records.push(record);
    existing.totalHours = Math.round((existing.totalHours + record.hours) * 100) / 100;
    existing.totalAmount = Math.round(
      (existing.totalAmount + (record.total || record.hours * record.hourlyRate)) * 100
    ) / 100;
    groups.set(record.workerId, existing);
  }

  return Array.from(groups.values());
}
