export interface WorkRecord {
  id: string;
  workerId: string;
  date: Date;
  hours: number;
  hourlyRate: number;
  description: string | null;
  weekId: string;
  createdAt: Date;
}

export interface CreateRecordInput {
  workerId: string;
  date: string;
  hours: number;
  hourlyRate: number;
  description?: string;
}
