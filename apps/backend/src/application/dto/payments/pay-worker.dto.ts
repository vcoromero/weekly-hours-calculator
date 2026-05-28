export interface PayWorkerInputDto {
  weekIds: string[];
}

export interface PayWorkerResultDto {
  paidWeeks: number;
  totalAmount: number;
}
