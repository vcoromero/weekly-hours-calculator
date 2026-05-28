import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WorkerPaymentRepository } from "../../../domain/ports/worker-payment.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { WorkerDashboardDto, WorkerDashboardItemDto } from "../../dto/workers/worker-dashboard.dto.js";
import { GetWorkerStatsUseCase } from "./get-worker-stats.use-case.js";

export class GetWorkerDashboardUseCase {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly calculator: TotalsCalculator,
    private readonly getStatsUseCase: GetWorkerStatsUseCase,
    private readonly paymentRepo: WorkerPaymentRepository,
  ) {}

  async execute(workerId: string): Promise<WorkerDashboardDto> {
    const records = await this.recordRepo.findByWorker(workerId);

    const weeksMap = new Map<string, WorkerDashboardItemDto>();

    for (const r of records) {
      const existing = weeksMap.get(r.weekId) || {
        weekId: r.weekId,
        label: r.week.label,
        startDate: this.weekCalc.formatDate(r.week.startDate),
        endDate: this.weekCalc.formatDate(r.week.endDate),
        totalHours: 0,
        totalEarnings: 0,
        status: r.week.status,
        recordCount: 0,
        isPaid: false,
      };

      existing.totalHours =
        Math.round((existing.totalHours + r.hours) * 100) / 100;
      existing.totalEarnings =
        Math.round(
          (existing.totalEarnings +
            this.calculator.recordTotal(r.hours, r.hourlyRate)) *
            100
        ) / 100;
      existing.recordCount += 1;

      weeksMap.set(r.weekId, existing);
    }

    const weeks = Array.from(weeksMap.values()).sort((a, b) => {
      const weekNumA = this.weekCalc.getWeekNumber(new Date(a.startDate));
      const weekNumB = this.weekCalc.getWeekNumber(new Date(b.startDate));
      return weekNumB - weekNumA;
    });

    const allWeekIds = weeks.map((w) => w.weekId);
    const payments = await this.paymentRepo.findByWorkerAndWeeks(workerId, allWeekIds);
    const paidWeekIds = new Set(payments.map((p) => p.weekId));

    const weeksWithPaid = weeks.map((w) => ({
      ...w,
      isPaid: paidWeekIds.has(w.weekId),
    }));

    const stats = await this.getStatsUseCase.execute(workerId);

    return { stats, weeks: weeksWithPaid };
  }
}