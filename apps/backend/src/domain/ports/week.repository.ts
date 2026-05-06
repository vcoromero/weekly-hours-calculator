import type { Week, WeekDateRange } from "../models/week.js";

export interface WeekRepository {
  findById(id: string): Promise<Week | null>;
  findByDateRange(start: Date, end: Date): Promise<Week | null>;
  create(data: { label: string; startDate: Date; endDate: Date }): Promise<Week>;
  updateStatus(id: string, status: string): Promise<Week>;
  findAllSaved(): Promise<Week[]>;
  findAll(): Promise<Week[]>;
  delete(id: string): Promise<void>;
}
