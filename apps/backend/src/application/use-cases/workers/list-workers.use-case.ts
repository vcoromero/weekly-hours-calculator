import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { WorkerResponseDto } from "../../dto/workers/worker-response.dto.js";

export class ListWorkersUseCase {
  constructor(private readonly workerRepo: WorkerRepository) {}

  async execute(): Promise<WorkerResponseDto[]> {
    const workers = await this.workerRepo.findAll();
    return workers.map((worker) => ({
      id: worker.id,
      name: worker.name,
      isRegular: worker.isRegular,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    }));
  }
}
