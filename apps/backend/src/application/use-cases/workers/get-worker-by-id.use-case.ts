import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { WorkerResponseDto } from "../../dto/workers/worker-response.dto.js";

export class GetWorkerByIdUseCase {
  constructor(private readonly workerRepo: WorkerRepository) {}

  async execute(id: string): Promise<WorkerResponseDto | null> {
    const worker = await this.workerRepo.findById(id);
    if (!worker) return null;

    return {
      id: worker.id,
      name: worker.name,
      isRegular: worker.isRegular,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    };
  }
}
