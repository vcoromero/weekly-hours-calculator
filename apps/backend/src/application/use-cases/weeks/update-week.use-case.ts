import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { SaveWeekResultDto } from "../../dto/weeks/save-week-result.dto.js";
import type { WeekRecordInputDto } from "../../dto/weeks/week-input.dto.js";
import { WeekError } from "../../../domain/errors/week.error.js";

export class UpdateWeekUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository
  ) {}

  async execute(weekId: string, records: WeekRecordInputDto[]): Promise<SaveWeekResultDto> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    await this.replaceWeekRecords(weekId, records);

    const updatedRecords = await this.recordRepo.findByWeekSimple(weekId);
    const totalAmount = updatedRecords.reduce(
      (sum, r) => sum + r.hours * r.hourlyRate,
      0
    );

    return {
      id: weekId,
      label: week.label,
      status: week.status as "draft" | "saved",
      recordsCount: updatedRecords.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  private async replaceWeekRecords(
    weekId: string,
    records: WeekRecordInputDto[]
  ): Promise<void> {
    await this.recordRepo.deleteByWeek(weekId);

    await this.recordRepo.createMany(
      records.map((r) => ({
        ...r,
        weekId,
        description: r.description || undefined,
      }))
    );
  }
}
