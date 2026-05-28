import type { PrismaClient } from "@prisma/client";
import type { WorkerPaymentRepository, CreatePaymentInput } from "../../../domain/ports/worker-payment.repository.js";
import type { WorkerPayment } from "../../../domain/entities/worker-payment.entity.js";

export class WorkerPaymentPrismaRepository implements WorkerPaymentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByWorkerAndWeeks(workerId: string, weekIds: string[]): Promise<WorkerPayment[]> {
    const payments = await this.prisma.workerPayment.findMany({
      where: { workerId, weekId: { in: weekIds } },
    });

    return payments.map((p) => ({
      id: p.id,
      workerId: p.workerId,
      weekId: p.weekId,
      totalAmount: p.totalAmount,
      paidAt: p.paidAt,
    }));
  }

  async create(data: CreatePaymentInput): Promise<WorkerPayment> {
    const payment = await this.prisma.workerPayment.create({
      data: {
        workerId: data.workerId,
        weekId: data.weekId,
        totalAmount: data.totalAmount,
      },
    });

    return {
      id: payment.id,
      workerId: payment.workerId,
      weekId: payment.weekId,
      totalAmount: payment.totalAmount,
      paidAt: payment.paidAt,
    };
  }

  async findByWeekId(weekId: string): Promise<WorkerPayment[]> {
    const payments = await this.prisma.workerPayment.findMany({
      where: { weekId },
    });

    return payments.map((p) => ({
      id: p.id,
      workerId: p.workerId,
      weekId: p.weekId,
      totalAmount: p.totalAmount,
      paidAt: p.paidAt,
    }));
  }
}