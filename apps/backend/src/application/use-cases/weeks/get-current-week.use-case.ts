import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { WeekWithTotalsDto } from "../../dto/weeks/week-with-totals.dto.js";
import { GetOrCreateCurrentWeekUseCase } from "./get-or-create-current-week.use-case.js";
import { BuildWeekWithTotalsHelper } from "./helpers/build-week-with-totals.helper.js";

export class GetCurrentWeekUseCase {
  constructor(
    private readonly getOrCreateCurrentWeek: GetOrCreateCurrentWeekUseCase,
    private readonly recordRepo: RecordRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly totalsCalc: TotalsCalculator
  ) {}

  async execute(): Promise<WeekWithTotalsDto> {
    const week = await this.getOrCreateCurrentWeek.execute();
    const records = await this.recordRepo.findByWeek(week.id);
    return BuildWeekWithTotalsHelper.execute(week, records, this.weekCalc, this.totalsCalc);
  }
}
