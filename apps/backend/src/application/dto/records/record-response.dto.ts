export interface RecordResponseDto {
  id: string;
  workerId: string;
  workerName: string;
  date: string;
  hours: number;
  hourlyRate: number;
  total: number;
  description: string | null;
  dayLockedAt: string | null;
}
