import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import { WeekError } from "../../../domain/errors/week.error.js";
import { RecordError } from "../../../domain/errors/record.error.js";

export class LockDayUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
  ) {}

  async execute(weekId: string): Promise<{ lockedDate: string; recordsCount: number }> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) {
      throw new WeekError("Week not found");
    }

    if (week.status === "saved") {
      throw new WeekError("Week is not in draft status");
    }

    const allRecords = await this.recordRepo.findByWeekSimple(weekId);

    const unlockedRecords = allRecords.filter((r) => r.dayLockedAt === null);

    if (unlockedRecords.length === 0) {
      throw new RecordError("No records to lock");
    }

    const uniqueDates = new Set(
      unlockedRecords.map((r) => r.date.toISOString().slice(0, 10)),
    );

    if (uniqueDates.size > 1) {
      throw new RecordError(
        `Cannot lock: records span multiple dates: ${Array.from(uniqueDates).join(", ")}`,
      );
    }

    const theDateStr = Array.from(uniqueDates)[0];
    const theDate = new Date(theDateStr);

    const recordsCount = await this.recordRepo.lockByWeekAndDate(
      weekId,
      theDate,
      new Date(),
    );

    return { lockedDate: theDateStr, recordsCount };
  }
}
