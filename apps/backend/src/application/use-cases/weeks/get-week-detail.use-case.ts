import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WorkerPaymentRepository } from "../../../domain/ports/worker-payment.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { WeekWithTotalsDto } from "../../dto/weeks/week-with-totals.dto.js";
import { WeekError } from "../../../domain/errors/week.error.js";
import { BuildWeekWithTotalsHelper } from "./helpers/build-week-with-totals.helper.js";

export class GetWeekDetailUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly totalsCalc: TotalsCalculator,
    private readonly paymentRepo: WorkerPaymentRepository,
  ) {}

  async execute(weekId: string): Promise<WeekWithTotalsDto> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    const records = await this.recordRepo.findByWeek(week.id);
    const payments = await this.paymentRepo.findByWeekId(weekId);

    return BuildWeekWithTotalsHelper.execute(week, records, this.weekCalc, this.totalsCalc, payments);
  }
}