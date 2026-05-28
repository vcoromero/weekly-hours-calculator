import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import type { WorkerPaymentRepository } from "../../../domain/ports/worker-payment.repository.js";
import { RecordError } from "../../../domain/errors/record.error.js";
import { PaymentError } from "../../../domain/errors/payment.error.js";

export class DeleteRecordUseCase {
  constructor(
    private readonly recordRepo: RecordRepository,
    private readonly paymentRepo: WorkerPaymentRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const record = await this.recordRepo.findById(id);
    if (!record) {
      throw new RecordError("Record not found");
    }

    const payments = await this.paymentRepo.findByWorkerAndWeeks(
      record.workerId,
      [record.weekId],
    );
    if (payments.length > 0) {
      throw new PaymentError("No se puede eliminar: el trabajador ya fue pagado en esta semana");
    }

    await this.recordRepo.delete(id);
  }
}