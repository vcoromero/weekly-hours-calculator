import type { RecordRepository } from "../../domain/ports/record.repository.js";
import type { WeekRepository } from "../../domain/ports/week.repository.js";
import type { WorkRecord, CreateRecordInput } from "../../domain/entities/work-record.entity.js";
import type { Week } from "../../domain/entities/week.entity.js";
import { TotalsCalculator } from "../../domain/services/totals-calculator.js";
import { WeekCalculator } from "../../domain/services/week-calculator.js";
import { RecordError } from "../../domain/errors/record.error.js";

export class RecordApplicationService {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly weekRepo: WeekRepository,
    private readonly calculator: TotalsCalculator,
    private readonly weekCalc: WeekCalculator
  ) {}

  async create(data: CreateRecordInput & { weekId: string }): Promise<WorkRecord & { week?: Week }> {
    const duplicate = await this.recordRepo.findDuplicate({
      workerId: data.workerId,
      date: data.date,
      hours: data.hours,
      hourlyRate: data.hourlyRate,
      weekId: data.weekId,
    });

    if (duplicate) {
      throw new RecordError("Duplicate record");
    }

    const range = this.weekCalc.getWeekForDate(data.date);
    let targetWeek = await this.weekRepo.findByDateRange(range.start, range.end);

    if (!targetWeek) {
      targetWeek = await this.weekRepo.create({
        label: range.label,
        startDate: range.start,
        endDate: range.end,
      });
    }

    const record = await this.recordRepo.create({
      ...data,
      weekId: targetWeek.id,
    });

    return { ...record, week: targetWeek };
  }

  async findByWeek(weekId: string) {
    const records = await this.recordRepo.findByWeek(weekId);

    return records.map((r) => ({
      id: r.id,
      workerId: r.workerId,
      workerName: r.worker.name,
      date: this.weekCalc.formatDate(r.date),
      hours: r.hours,
      hourlyRate: r.hourlyRate,
      total: this.calculator.recordTotal(r.hours, r.hourlyRate),
      description: r.description,
    }));
  }

  async delete(id: string): Promise<void> {
    const record = await this.recordRepo.findById(id);
    if (!record) {
      throw new RecordError("Record not found");
    }

    await this.recordRepo.delete(id);
  }
}

export { RecordError } from "../../domain/errors/record.error.js";
