import type { WeekStatus } from "../../../domain/value-objects/week-status.vo.js";

export interface WorkerTotalDto {
  workerId: string;
  workerName: string;
  totalHours: number;
  totalAmount: number;
}

export interface WeekRecordDto {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  hours: number;
  hourlyRate: number;
  total: number;
  description: string | null;
}

export interface WeekWithTotalsDto {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  records: WeekRecordDto[];
  totalsByWorker: WorkerTotalDto[];
  grandTotal: number;
  createdAt: Date;
  payments: Array<{ workerId: string; paidAt: string }>;
}
