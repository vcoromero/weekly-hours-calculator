import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { WorkerStatsDto } from "../../dto/workers/worker-stats.dto.js";

export class GetWorkerStatsUseCase {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly calculator: TotalsCalculator
  ) {}

  async execute(workerId: string): Promise<WorkerStatsDto> {
    const records = await this.recordRepo.findByWorker(workerId);

    if (records.length === 0) {
      return {
        totalHours: 0,
        totalEarnings: 0,
        weeksActive: 0,
        averageHoursPerWeek: 0,
        averageHourlyRate: 0,
      };
    }

    const weekIds = new Set(records.map((r) => r.weekId));
    const totalHours = records.reduce((s, r) => s + r.hours, 0);
    const totalEarnings = records.reduce(
      (s, r) => s + this.calculator.recordTotal(r.hours, r.hourlyRate),
      0
    );
    const avgRate =
      records.reduce((s, r) => s + r.hourlyRate, 0) / records.length;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      weeksActive: weekIds.size,
      averageHoursPerWeek: Math.round((totalHours / weekIds.size) * 100) / 100,
      averageHourlyRate: Math.round(avgRate * 100) / 100,
    };
  }
}
