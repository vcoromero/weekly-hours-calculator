import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { WorkerHistoryDto } from "../../dto/workers/worker-history.dto.js";

export class GetWorkerHistoryUseCase {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly calculator: TotalsCalculator
  ) {}

  async execute(workerId: string): Promise<WorkerHistoryDto[]> {
    const records = await this.recordRepo.findByWorker(workerId);

    const weeksMap = new Map<
      string,
      {
        weekId: string;
        label: string;
        startDate: string;
        endDate: string;
        totalHours: number;
        totalEarnings: number;
        records: WorkerHistoryDto["records"];
      }
    >();

    for (const r of records) {
      const existing = weeksMap.get(r.weekId) || {
        weekId: r.weekId,
        label: r.week.label,
        startDate: this.weekCalc.formatDate(r.week.startDate),
        endDate: this.weekCalc.formatDate(r.week.endDate),
        totalHours: 0,
        totalEarnings: 0,
        records: [],
      };

      const total = this.calculator.recordTotal(r.hours, r.hourlyRate);
      existing.totalHours += r.hours;
      existing.totalEarnings += total;
      existing.records.push({
        id: r.id,
        date: this.weekCalc.formatDate(r.date),
        hours: r.hours,
        hourlyRate: r.hourlyRate,
        total,
        description: r.description,
      });

      weeksMap.set(r.weekId, existing);
    }

    return Array.from(weeksMap.values()).map((w) => ({
      ...w,
      totalHours: Math.round(w.totalHours * 100) / 100,
      totalEarnings: Math.round(w.totalEarnings * 100) / 100,
    }));
  }
}
