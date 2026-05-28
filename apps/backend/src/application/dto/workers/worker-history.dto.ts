export interface WorkerHistoryDto {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalEarnings: number;
  records: Array<{
    id: string;
    date: string;
    hours: number;
    hourlyRate: number;
    total: number;
    description: string | null;
  }>;
}
