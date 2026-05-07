import type { WorkerTotal } from "../entities/week.entity.js";

const DECIMAL_PRECISION = 100;

interface RecordLike {
  workerId: string;
  hours: number;
  hourlyRate: number;
}

export class TotalsCalculator {
  recordTotal(hours: number, hourlyRate: number): number {
    return Math.round(hours * hourlyRate * DECIMAL_PRECISION) / DECIMAL_PRECISION;
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
    return Math.round(value * DECIMAL_PRECISION) / DECIMAL_PRECISION;
  }
}
