import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { WorkerPaymentRepository } from "../../../domain/ports/worker-payment.repository.js";
import { WeekError } from "../../../domain/errors/week.error.js";
import { PaymentError } from "../../../domain/errors/payment.error.js";

export class DeleteWeekUseCase {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly paymentRepo: WorkerPaymentRepository,
  ) {}

  async execute(weekId: string): Promise<void> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    const payments = await this.paymentRepo.findByWeekId(weekId);
    if (payments.length > 0) {
      throw new PaymentError("No se puede eliminar: la semana tiene pagos asociados");
    }

    await this.weekRepo.delete(weekId);
  }
}
