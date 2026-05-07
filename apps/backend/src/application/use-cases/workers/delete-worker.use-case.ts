import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import { WorkerDeleteError } from "../../../domain/errors/worker-delete.error.js";

export class DeleteWorkerUseCase {
  constructor(private readonly workerRepo: WorkerRepository) {}

  async execute(id: string): Promise<void> {
    const count = await this.workerRepo.countRecords(id);
    if (count > 0) {
      throw new WorkerDeleteError("Cannot delete worker with existing records");
    }
    await this.workerRepo.delete(id);
  }
}
