import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { WeekSummaryDto } from "../../dto/weeks/week-summary.dto.js";
import type { WeekStatus } from "../../../domain/value-objects/week-status.vo.js";
import type { PaginatedResponse } from "../../dto/shared/pagination.dto.js";

export interface ListWeeksParams {
  page: number;
  pageSize: number;
}

export class ListWeeksUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly totalsCalc: TotalsCalculator
  ) {}

  async execute(params: ListWeeksParams): Promise<PaginatedResponse<WeekSummaryDto>> {
    const skip = (params.page - 1) * params.pageSize;
    const { weeks, total } = await this.weekRepo.findAllSavedPaginated(skip, params.pageSize);

    const sortedWeeks = [...weeks].sort((a, b) => {
      const weekNumA = this.weekCalc.getWeekNumber(a.startDate);
      const weekNumB = this.weekCalc.getWeekNumber(b.startDate);
      return weekNumB - weekNumA;
    });

    const items: WeekSummaryDto[] = [];
    for (const week of sortedWeeks) {
      const records = await this.recordRepo.findByWeekSimple(week.id);
      items.push({
        id: week.id,
        label: week.label,
        startDate: this.weekCalc.formatDate(week.startDate),
        endDate: this.weekCalc.formatDate(week.endDate),
        status: week.status as WeekStatus,
        totalRecords: records.length,
        totalAmount: this.totalsCalc.grandTotal(
          records.map((r) => ({
            workerId: r.workerId,
            workerName: "",
            totalHours: r.hours,
            totalAmount: r.hours * r.hourlyRate,
          }))
        ),
        createdAt: week.createdAt.toISOString(),
      });
    }

    return {
      items,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }
}
