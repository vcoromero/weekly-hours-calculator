import type { PrismaClient } from "@prisma/client";
import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { Worker } from "../../../domain/models/worker.js";

export class WorkerPrismaRepository implements WorkerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Worker[]> {
    const workers = await this.prisma.worker.findMany({
      orderBy: { name: "asc" },
    });
    return workers.map(this.map);
  }

  async findById(id: string): Promise<Worker | null> {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    return worker ? this.map(worker) : null;
  }

  async create(data: { name: string; isRegular: boolean }): Promise<Worker> {
    const worker = await this.prisma.worker.create({ data });
    return this.map(worker);
  }

  async update(
    id: string,
    data: { name?: string; isRegular?: boolean }
  ): Promise<Worker> {
    const worker = await this.prisma.worker.update({ where: { id }, data });
    return this.map(worker);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.worker.delete({ where: { id } });
  }

  async countRecords(workerId: string): Promise<number> {
    return this.prisma.workRecord.count({ where: { workerId } });
  }

  private map(prismaWorker: {
    id: string;
    name: string;
    isRegular: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Worker {
    return {
      id: prismaWorker.id,
      name: prismaWorker.name,
      isRegular: prismaWorker.isRegular,
      createdAt: prismaWorker.createdAt,
      updatedAt: prismaWorker.updatedAt,
    };
  }
}
