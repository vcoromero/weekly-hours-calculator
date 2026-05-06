import type { RecordRepository } from "../../domain/ports/record.repository.js";
import type { WeekRepository } from "../../domain/ports/week.repository.js";
import type { WorkRecord, CreateRecordInput } from "../../domain/models/work-record.js";
import { TotalsCalculator } from "../../domain/services/totals-calculator.js";
import { WeekCalculator } from "../../domain/services/week-calculator.js";

export class RecordApplicationService {
  private readonly calculator = new TotalsCalculator();
  private readonly weekCalc = new WeekCalculator();

  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly weekRepo: WeekRepository
  ) {}

  async create(data: CreateRecordInput & { weekId: string }): Promise<WorkRecord> {
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

    const week = await this.weekRepo.findById(data.weekId);
    if (!week) {
      throw new RecordError("Week not found");
    }

    if (week.status === "saved") {
      throw new RecordError("Cannot add records to a saved week");
    }

    return this.recordRepo.create(data);
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

    if (record.week.status === "saved") {
      throw new RecordError("Cannot delete records from a saved week");
    }

    await this.recordRepo.delete(id);
  }
}

export class RecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RecordError";
  }
}
