import type { WorkerRepository } from "../../../domain/ports/worker.repository.js";
import type { WorkerResponseDto } from "../../dto/workers/worker-response.dto.js";
import type { PaginatedResponse } from "../../dto/shared/pagination.dto.js";

export interface ListWorkersParams {
  search?: string;
  isRegular?: boolean;
  page: number;
  pageSize: number;
}

export class ListWorkersUseCase {
  constructor(private readonly workerRepo: WorkerRepository) {}

  async execute(params: ListWorkersParams): Promise<PaginatedResponse<WorkerResponseDto>> {
    const skip = (params.page - 1) * params.pageSize;
    const { workers, total } = await this.workerRepo.findAllWithFilters({
      search: params.search,
      isRegular: params.isRegular,
      skip,
      take: params.pageSize,
    });

    return {
      items: workers.map((worker) => ({
        id: worker.id,
        name: worker.name,
        isRegular: worker.isRegular,
        createdAt: worker.createdAt,
        updatedAt: worker.updatedAt,
      })),
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total,
        totalPages: Math.ceil(total / params.pageSize),
      },
    };
  }
}
