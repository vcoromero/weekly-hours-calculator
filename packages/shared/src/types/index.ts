export interface Worker {
  id: string;
  name: string;
  isRegular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkRecord {
  id: string;
  workerId: string;
  workerName?: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description?: string;
  total?: number;
}

export interface Week {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  status: "draft" | "saved";
  records?: WorkRecord[];
  totalsByWorker?: WorkerTotal[];
  grandTotal?: number;
  totalRecords?: number;
  totalAmount?: number;
  createdAt: string;
}

export interface WorkerTotal {
  workerId: string;
  workerName: string;
  totalHours: number;
  totalAmount: number;
}

export interface WorkerStats {
  totalHours: number;
  totalEarnings: number;
  weeksActive: number;
  averageHoursPerWeek: number;
  averageHourlyRate: number;
}

export interface WorkerHistoryItem {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalEarnings: number;
  records: WorkRecord[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface CreateWorkerInput {
  name: string;
  isRegular: boolean;
}

export interface UpdateWorkerInput {
  name?: string;
  isRegular?: boolean;
}

export interface CreateRecordInput {
  workerId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description?: string;
}

export interface SaveWeekInput {
  weekId: string;
  records: CreateRecordInput[];
}

export interface ApiError {
  error: string;
  details?: unknown;
}
