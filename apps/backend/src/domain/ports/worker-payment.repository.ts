import type { WorkerPayment } from "../entities/worker-payment.entity.js";

export interface CreatePaymentInput {
  workerId: string;
  weekId: string;
  totalAmount: number;
}

export interface WorkerPaymentRepository {
  findByWorkerAndWeeks(workerId: string, weekIds: string[]): Promise<WorkerPayment[]>;
  create(data: CreatePaymentInput): Promise<WorkerPayment>;
  findByWeekId(weekId: string): Promise<WorkerPayment[]>;
}