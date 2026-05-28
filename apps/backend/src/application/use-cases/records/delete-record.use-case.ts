import type { RecordRepository } from "../../../domain/ports/record.repository.js";
import { RecordError } from "../../../domain/errors/record.error.js";

export class DeleteRecordUseCase {
  constructor(private readonly recordRepo: RecordRepository) {}

  async execute(id: string): Promise<void> {
    const record = await this.recordRepo.findById(id);
    if (!record) {
      throw new RecordError("Record not found");
    }

    await this.recordRepo.delete(id);
  }
}
