export type WeekStatus = "draft" | "saved";

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

export interface WeekWithTotals {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  records: Array<{
    id: string;
    workerId: string;
    workerName: string;
    date: string;
    hours: number;
    hourlyRate: number;
    total: number;
    description: string | null;
  }>;
  totalsByWorker: WorkerTotal[];
  grandTotal: number;
  createdAt: Date;
}

export interface WeekSummary {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  totalRecords: number;
  totalAmount: number;
  createdAt: string;
}

export interface SaveWeekResult {
  id: string;
  label: string;
  status: "saved";
  recordsCount: number;
  totalAmount: number;
}

export interface WeekDateRange {
  start: Date;
  end: Date;
  label: string;
}
