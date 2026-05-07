import type { Worker } from "../../../domain/entities/worker.entity.js";

interface PrismaWorker {
  id: string;
  name: string;
  isRegular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkerMapper {
  static toDomain(prismaWorker: PrismaWorker): Worker {
    return {
      id: prismaWorker.id,
      name: prismaWorker.name,
      isRegular: prismaWorker.isRegular,
      createdAt: prismaWorker.createdAt,
      updatedAt: prismaWorker.updatedAt,
    };
  }
}
