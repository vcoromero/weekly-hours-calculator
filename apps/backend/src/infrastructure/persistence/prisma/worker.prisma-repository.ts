import type { PrismaClient } from "@prisma/client";
import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { Worker } from "../../../domain/entities/worker.entity.js";
import { WorkerMapper } from "../mappers/worker.mapper.js";

export class WorkerPrismaRepository implements WorkerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Worker[]> {
    const workers = await this.prisma.worker.findMany({
      orderBy: { name: "asc" },
    });
    return workers.map(WorkerMapper.toDomain);
  }

  async findById(id: string): Promise<Worker | null> {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    return worker ? WorkerMapper.toDomain(worker) : null;
  }

  async create(data: { name: string; isRegular: boolean }): Promise<Worker> {
    const worker = await this.prisma.worker.create({ data });
    return WorkerMapper.toDomain(worker);
  }

  async update(
    id: string,
    data: { name?: string; isRegular?: boolean }
  ): Promise<Worker> {
    const worker = await this.prisma.worker.update({ where: { id }, data });
    return WorkerMapper.toDomain(worker);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.worker.delete({ where: { id } });
  }

  async countRecords(workerId: string): Promise<number> {
    return this.prisma.workRecord.count({ where: { workerId } });
  }
}
