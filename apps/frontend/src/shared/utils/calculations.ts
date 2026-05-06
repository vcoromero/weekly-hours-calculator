import type { WorkerTotal } from "../types";

export function recordTotal(hours: number, hourlyRate: number): number {
  return Math.round(hours * hourlyRate * 100) / 100;
}

export function totalsByWorker(
  records: Array<{ workerId: string; workerName: string; hours: number; hourlyRate: number }>,
  workers: Array<{ id: string; name: string }>
): WorkerTotal[] {
  const nameMap = new Map(workers.map((w) => [w.id, w.name]));
  const map = new Map<string, { totalHours: number; totalAmount: number; workerName: string }>();

  for (const r of records) {
    const existing = map.get(r.workerId) || {
      totalHours: 0,
      totalAmount: 0,
      workerName: r.workerName || nameMap.get(r.workerId) || "Unknown",
    };
    map.set(r.workerId, {
      workerName: existing.workerName,
      totalHours: Math.round((existing.totalHours + r.hours) * 100) / 100,
      totalAmount:
        Math.round((existing.totalAmount + r.hours * r.hourlyRate) * 100) / 100,
    });
  }

  return Array.from(map.entries()).map(([workerId, totals]) => ({
    workerId,
    workerName: totals.workerName,
    totalHours: totals.totalHours,
    totalAmount: totals.totalAmount,
  }));
}

export function grandTotal(totalsByWorker: WorkerTotal[]): number {
  return (
    Math.round(totalsByWorker.reduce((sum, w) => sum + w.totalAmount, 0) * 100) /
    100
  );
}
