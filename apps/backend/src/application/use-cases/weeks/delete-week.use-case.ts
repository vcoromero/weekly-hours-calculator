import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import { WeekError } from "../../../domain/errors/week.error.js";

export class DeleteWeekUseCase {
  constructor(private readonly weekRepo: WeekRepository) {}

  async execute(weekId: string): Promise<void> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    await this.weekRepo.delete(weekId);
  }
}
