import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";

export class GetOrCreateCurrentWeekUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly weekCalc: WeekCalculator
  ) {}

  async execute() {
    const range = this.weekCalc.getPreviousWeek();

    let week = await this.weekRepo.findByDateRange(range.start, range.end);

    if (!week) {
      week = await this.weekRepo.create({
        label: range.label,
        startDate: range.start,
        endDate: range.end,
      });
    }

    return week;
  }
}
