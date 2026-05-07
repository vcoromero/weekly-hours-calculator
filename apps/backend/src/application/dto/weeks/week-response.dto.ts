import type { WeekStatus } from "../../../domain/value-objects/week-status.vo.js";

export interface WeekResponseDto {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  createdAt: Date;
}
