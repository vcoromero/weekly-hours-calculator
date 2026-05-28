import type { WorkerPayment } from '../entities/worker-payment.entity.js';

export interface WorkerPaymentRepository {
  findByWorkerAndWeeks(workerId: string, weekIds: string[]): Promise<WorkerPayment[]>;
}