import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { Week } from "../../../domain/entities/week.entity.js";

export class ListAllWeeksUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly weekCalc: WeekCalculator
  ) {}

  async execute(): Promise<Week[]> {
    const weeks = await this.weekRepo.findAll();
    return weeks.sort((a, b) => {
      const weekNumA = this.weekCalc.getWeekNumber(a.startDate);
      const weekNumB = this.weekCalc.getWeekNumber(b.startDate);
      return weekNumB - weekNumA;
    });
  }
}
