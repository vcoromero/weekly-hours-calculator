import type { Week } from "../entities/week.entity.js";
import type { WeekDateRange } from "../value-objects/week-date-range.vo.js";

export interface WeekRepository {
  findById(id: string): Promise<Week | null>;
  findByDateRange(start: Date, end: Date): Promise<Week | null>;
  create(data: { label: string; startDate: Date; endDate: Date }): Promise<Week>;
  updateStatus(id: string, status: string): Promise<Week>;
  findAllSaved(): Promise<Week[]>;
  findAllSavedPaginated(skip: number, take: number): Promise<{ weeks: Week[]; total: number }>;
  findAll(): Promise<Week[]>;
  delete(id: string): Promise<void>;
}
