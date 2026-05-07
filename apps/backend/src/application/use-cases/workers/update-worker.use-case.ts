import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { UpdateWorkerDto } from "../../dto/workers/update-worker.dto.js";
import type { WorkerResponseDto } from "../../dto/workers/worker-response.dto.js";

export class UpdateWorkerUseCase {
  constructor(private readonly workerRepo: WorkerRepository) {}

  async execute(id: string, input: UpdateWorkerDto): Promise<WorkerResponseDto> {
    const worker = await this.workerRepo.update(id, input);
    return {
      id: worker.id,
      name: worker.name,
      isRegular: worker.isRegular,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    };
  }
}
