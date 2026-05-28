import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WorkerPaymentRepository } from "../../../domain/ports/worker-payment.repository.js";
import type { SaveWeekResultDto } from "../../dto/weeks/save-week-result.dto.js";
import type { WeekRecordInputDto } from "../../dto/weeks/week-input.dto.js";
import type { CreateRecordInput } from "../../../domain/entities/work-record.entity.js";
import { WeekError } from "../../../domain/errors/week.error.js";
import { PaymentError } from "../../../domain/errors/payment.error.js";

export class UpdateWeekUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
    private readonly paymentRepo: WorkerPaymentRepository,
  ) {}

  async execute(weekId: string, records: WeekRecordInputDto[]): Promise<SaveWeekResultDto> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    const payments = await this.paymentRepo.findByWeekId(weekId);
    const paidWorkerIds = new Set(payments.map((p) => p.workerId));

    for (const r of records) {
      if (paidWorkerIds.has(r.workerId)) {
        throw new PaymentError("No se puede modificar: el trabajador ya fue pagado en esta semana");
      }
    }

    const preserved: CreateRecordInput[] = [];
    if (paidWorkerIds.size > 0) {
      const existing = await this.recordRepo.findByWeek(weekId);
      for (const r of existing) {
        if (paidWorkerIds.has(r.workerId)) {
          preserved.push({
            workerId: r.workerId,
            date: r.date.toISOString().slice(0, 10),
            hours: r.hours,
            hourlyRate: r.hourlyRate,
            description: r.description || undefined,
          });
        }
      }
    }

    await this.recordRepo.deleteByWeek(weekId);
    await this.recordRepo.createMany([
      ...records.map((r) => ({
        ...r,
        weekId,
        description: r.description || undefined,
      })),
      ...preserved.map((r) => ({
        ...r,
        weekId,
        description: r.description || undefined,
      })),
    ]);

    const updatedRecords = await this.recordRepo.findByWeekSimple(weekId);
    const totalAmount = updatedRecords.reduce(
      (sum, r) => sum + r.hours * r.hourlyRate,
      0,
    );

    return {
      id: weekId,
      label: week.label,
      status: week.status as "draft" | "saved",
      recordsCount: updatedRecords.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }
}