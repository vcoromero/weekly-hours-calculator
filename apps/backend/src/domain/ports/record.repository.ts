import type { WorkRecord, CreateRecordInput } from "../entities/work-record.entity.js";

export interface RecordWithWorker extends WorkRecord {
  worker: { id: string; name: string };
  week: { id: string; label: string; startDate: Date; endDate: Date; status: string };
}

export interface RecordRepository {
  create(data: CreateRecordInput & { weekId: string }): Promise<WorkRecord>;
  findByWeek(weekId: string): Promise<RecordWithWorker[]>;
  findByWorker(workerId: string): Promise<RecordWithWorker[]>;
  findById(id: string): Promise<RecordWithWorker | null>;
  findDuplicate(data: {
    workerId: string;
    date: string;
    hours: number;
    hourlyRate: number;
    weekId: string;
  }): Promise<WorkRecord | null>;
  delete(id: string): Promise<void>;
  deleteByWeek(weekId: string): Promise<void>;
  createMany(data: Array<CreateRecordInput & { weekId: string }>): Promise<void>;
  findByWeekSimple(weekId: string): Promise<WorkRecord[]>;
}
