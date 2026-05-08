export interface InvoiceRecordData {
  date: string;
  hours: number;
  hourlyRate: number;
  total: number;
  description: string | null;
}

export interface InvoiceWeekData {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  records: InvoiceRecordData[];
  totalHours: number;
  totalAmount: number;
}

export interface InvoiceDataDto {
  workerName: string;
  generatedAt: Date;
  weeks: InvoiceWeekData[];
  grandTotalHours: number;
  grandTotalAmount: number;
}