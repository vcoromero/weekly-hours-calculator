import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WorkerPaymentRepository } from "../../../domain/ports/worker-payment.repository.js";
import { PaymentError } from "../../../domain/errors/payment.error.js";
import type { PayWorkerInputDto, PayWorkerResultDto } from "../../dto/payments/pay-worker.dto.js";

export class PayWorkerUseCase {
  constructor(
    private readonly workerRepo: WorkerRepository,
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
    private readonly paymentRepo: WorkerPaymentRepository,
  ) {}

  async execute(workerId: string, input: PayWorkerInputDto): Promise<PayWorkerResultDto> {
    const { weekIds } = input;

    const worker = await this.workerRepo.findById(workerId);
    if (!worker) {
      throw new PaymentError("Worker not found");
    }

    if (!weekIds || weekIds.length === 0) {
      throw new PaymentError("At least one week must be selected");
    }

    const weeks = await Promise.all(
      weekIds.map(async (id) => {
        const week = await this.weekRepo.findById(id);
        if (!week) {
          throw new PaymentError(`Week ${id} not found`);
        }
        if (week.status !== "saved") {
          throw new PaymentError("Cannot pay draft weeks");
        }
        return week;
      }),
    );

    const existingPayments = await this.paymentRepo.findByWorkerAndWeeks(workerId, weekIds);
    if (existingPayments.length > 0) {
      throw new PaymentError("One or more weeks are already paid for this worker");
    }

    const totalAmounts: number[] = [];

    for (const week of weeks) {
      const records = await this.recordRepo.findByWeek(week.id);
      const workerRecords = records.filter((r) => r.workerId === workerId);

      if (workerRecords.length === 0) {
        throw new PaymentError(`No records found for worker in week "${week.label}"`);
      }

      const totalAmount = workerRecords.reduce(
        (sum, r) => sum + r.hours * r.hourlyRate,
        0,
      );
      totalAmounts.push(Math.round(totalAmount * 100) / 100);
    }

    await Promise.all(
      weeks.map((week, i) =>
        this.paymentRepo.create({
          workerId,
          weekId: week.id,
          totalAmount: totalAmounts[i],
        }),
      ),
    );

    const grandTotal = totalAmounts.reduce((sum, a) => sum + a, 0);

    return {
      paidWeeks: weekIds.length,
      totalAmount: Math.round(grandTotal * 100) / 100,
    };
  }
}