import type { WeekStatus } from "../value-objects/week-status.vo.js";

export type { WeekStatus };

export interface Week {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  status: WeekStatus;
  createdAt: Date;
}

export interface WorkerTotal {
  workerId: string;
  workerName: string;
  totalHours: number;
  totalAmount: number;
}
