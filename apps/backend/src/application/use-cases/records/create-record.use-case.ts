import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { CreateRecordDto } from "../../dto/records/create-record.dto.js";
import { RecordError } from "../../../domain/errors/record.error.js";

export class CreateRecordUseCase {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly weekRepo: WeekRepository,
    private readonly weekCalc: WeekCalculator
  ) {}

  async execute(data: CreateRecordDto) {
    const duplicate = await this.recordRepo.findDuplicate({
      workerId: data.workerId,
      date: data.date,
      hours: data.hours,
      hourlyRate: data.hourlyRate,
      weekId: data.weekId,
    });

    if (duplicate) {
      throw new RecordError("Duplicate record");
    }

    const range = this.weekCalc.getWeekForDate(data.date);
    let targetWeek = await this.weekRepo.findByDateRange(range.start, range.end);

    if (!targetWeek) {
      targetWeek = await this.weekRepo.create({
        label: range.label,
        startDate: range.start,
        endDate: range.end,
      });
    }

    const record = await this.recordRepo.create({
      ...data,
      weekId: targetWeek.id,
    });

    return { ...record, week: targetWeek };
  }
}
