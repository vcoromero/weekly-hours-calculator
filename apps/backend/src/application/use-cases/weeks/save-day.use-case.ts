import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import { WeekError } from "../../../domain/errors/week.error.js";
import { RecordError } from "../../../domain/errors/record.error.js";

export class SaveDayUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
  ) {}

  async execute(weekId: string): Promise<{ savedDate: string; recordsCount: number }> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) {
      throw new WeekError("Week not found");
    }

    if (week.status === "saved") {
      throw new WeekError("Week is not in draft status");
    }

    const allRecords = await this.recordRepo.findByWeekSimple(weekId);

    const unsavedRecords = allRecords.filter((r) => r.daySavedAt === null);

    if (unsavedRecords.length === 0) {
      throw new RecordError("No records to save");
    }

    const uniqueDates = new Set(
      unsavedRecords.map((r) => r.date.toISOString().slice(0, 10)),
    );

    if (uniqueDates.size > 1) {
      throw new RecordError(
        `Cannot save: records span multiple dates: ${Array.from(uniqueDates).join(", ")}`,
      );
    }

    const theDateStr = Array.from(uniqueDates)[0];
    const theDate = new Date(theDateStr);

    const recordsCount = await this.recordRepo.markDaySaved(
      weekId,
      theDate,
      new Date(),
    );

    return { savedDate: theDateStr, recordsCount };
  }
}
