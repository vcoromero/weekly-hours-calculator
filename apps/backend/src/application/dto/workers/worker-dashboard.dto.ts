import type { WorkerStatsDto } from "./worker-stats.dto.js";

export interface WorkerDashboardItemDto {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalEarnings: number;
  status: string;
  recordCount: number;
  isPaid: boolean;
}

export interface WorkerDashboardDto {
  stats: WorkerStatsDto;
  weeks: WorkerDashboardItemDto[];
}
