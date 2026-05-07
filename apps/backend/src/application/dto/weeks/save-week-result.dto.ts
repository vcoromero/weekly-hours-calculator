import type { WeekStatus } from "../../../domain/value-objects/week-status.vo.js";

export interface SaveWeekResultDto {
  id: string;
  label: string;
  status: WeekStatus;
  recordsCount: number;
  totalAmount: number;
}
