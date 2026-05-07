export interface CreateRecordDto {
  weekId: string;
  workerId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description?: string;
}
