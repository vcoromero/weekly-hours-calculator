import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { WeekCalculator } from "../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../domain/services/totals-calculator.js";
import type { WeekWithTotalsDto } from "../../dto/weeks/week-with-totals.dto.js";
import type { WeekRecordInputDto } from "../../dto/weeks/week-input.dto.js";
import type { WeekStatus } from "../../../domain/value-objects/week-status.vo.js";
import { WeekError } from "../../../domain/errors/week.error.js";

export class PreviewWeekUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly workerRepo: WorkerRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly totalsCalc: TotalsCalculator
  ) {}

  async execute(weekId: string, records: WeekRecordInputDto[]): Promise<WeekWithTotalsDto> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    const workerIds = [...new Set(records.map((r) => r.workerId))];
    const allWorkers = await this.workerRepo.findAll();
    const workerNames = new Map(
      allWorkers
        .filter((w) => workerIds.includes(w.id))
        .map((w) => [w.id, w.name])
    );

    const totalsByWorker = this.totalsCalc.totalsByWorker(records, workerNames);

    return {
      id: week.id,
      label: week.label,
      startDate: this.weekCalc.formatDate(week.startDate),
      endDate: this.weekCalc.formatDate(week.endDate),
      status: week.status as WeekStatus,
      records: records.map((r) => ({
        id: "preview-" + crypto.randomUUID().slice(0, 8),
        workerId: r.workerId,
        workerName: workerNames.get(r.workerId) || "Unknown",
        date: r.date,
        hours: r.hours,
        hourlyRate: r.hourlyRate,
        total: this.totalsCalc.recordTotal(r.hours, r.hourlyRate),
        description: r.description || null,
      })),
      totalsByWorker,
      grandTotal: this.totalsCalc.grandTotal(totalsByWorker),
      createdAt: week.createdAt,
      payments: [],
    };
  }
}
