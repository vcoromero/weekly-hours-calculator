import type { WeekStatus } from "../../../domain/value-objects/week-status.vo.js";

export interface WeekSummaryDto {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  totalRecords: number;
  totalAmount: number;
  createdAt: string;
}
