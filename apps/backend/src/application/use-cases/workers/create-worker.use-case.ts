import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { CreateWorkerDto } from "../../dto/workers/create-worker.dto.js";
import type { WorkerResponseDto } from "../../dto/workers/worker-response.dto.js";

export class CreateWorkerUseCase {
  constructor(private readonly workerRepo: WorkerRepository) {}

  async execute(input: CreateWorkerDto): Promise<WorkerResponseDto> {
    const worker = await this.workerRepo.create(input);
    return {
      id: worker.id,
      name: worker.name,
      isRegular: worker.isRegular,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    };
  }
}
