import type { WorkerTotal } from "../models/week.js";

interface RecordLike {
  workerId: string;
  hours: number;
  hourlyRate: number;
}

export class TotalsCalculator {
  recordTotal(hours: number, hourlyRate: number): number {
    return Math.round(hours * hourlyRate * 100) / 100;
  }

  totalsByWorker(
    records: RecordLike[],
    workerNames: Map<string, string>
  ): WorkerTotal[] {
    const map = new Map<string, { totalHours: number; totalAmount: number }>();

    for (const r of records) {
      const existing = map.get(r.workerId) || { totalHours: 0, totalAmount: 0 };
      map.set(r.workerId, {
        totalHours: this.round(existing.totalHours + r.hours),
        totalAmount: this.round(existing.totalAmount + r.hours * r.hourlyRate),
      });
    }

    return Array.from(map.entries()).map(([workerId, totals]) => ({
      workerId,
      workerName: workerNames.get(workerId) || "Unknown",
      totalHours: totals.totalHours,
      totalAmount: totals.totalAmount,
    }));
  }

  grandTotal(totalsByWorker: WorkerTotal[]): number {
    return this.round(
      totalsByWorker.reduce((sum, w) => sum + w.totalAmount, 0)
    );
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
