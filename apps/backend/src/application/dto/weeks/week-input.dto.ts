export interface WeekRecordInputDto {
  workerId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description?: string;
}

export interface PreviewWeekDto {
  weekId: string;
  records: WeekRecordInputDto[];
}

export interface SaveWeekDto {
  weekId: string;
  records: WeekRecordInputDto[];
}

export interface UpdateWeekDto {
  records: WeekRecordInputDto[];
}
