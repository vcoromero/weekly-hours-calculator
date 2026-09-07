import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { RecordResponseDto } from "../../dto/records/record-response.dto.js";

export class GetRecordsByWeekUseCase {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly calculator: TotalsCalculator
  ) {}

  async execute(weekId: string): Promise<RecordResponseDto[]> {
    const records = await this.recordRepo.findByWeek(weekId);

    return records.map((r) => ({
      id: r.id,
      workerId: r.workerId,
      workerName: r.worker.name,
      date: this.weekCalc.formatDate(r.date),
      hours: r.hours,
      hourlyRate: r.hourlyRate,
      total: this.calculator.recordTotal(r.hours, r.hourlyRate),
      description: r.description,
      dayLockedAt: r.dayLockedAt ? r.dayLockedAt.toISOString() : null,
    }));
  }
}
