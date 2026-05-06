import type { WorkerRepository } from "../../domain/ports/worker.repository.js";
import type { RecordRepository } from "../../domain/ports/record.repository.js";
import type { WeekRepository } from "../../domain/ports/week.repository.js";
import type { Worker } from "../../domain/models/worker.js";
import type {
  WorkerHistoryItem,
  WorkerStats,
} from "../../domain/models/worker-history.js";
import { TotalsCalculator } from "../../domain/services/totals-calculator.js";
import { WeekCalculator } from "../../domain/services/week-calculator.js";

interface WorkerDashboardItem {
  weekId: string;
  label: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  totalEarnings: number;
  status: string;
  recordCount: number;
}

export interface WorkerDashboard {
  stats: WorkerStats;
  weeks: WorkerDashboardItem[];
}

export class WorkerApplicationService {
  constructor(
    private readonly workerRepo: WorkerRepository,
    private readonly recordRepo: RecordRepository,
    private readonly weekRepo: WeekRepository,
    private readonly calculator: TotalsCalculator,
    private readonly weekCalc: WeekCalculator
  ) {}

  async list(): Promise<Worker[]> {
    return this.workerRepo.findAll();
  }

  async getById(id: string): Promise<Worker | null> {
    return this.workerRepo.findById(id);
  }

  async create(data: { name: string; isRegular: boolean }): Promise<Worker> {
    return this.workerRepo.create(data);
  }

  async update(
    id: string,
    data: { name?: string; isRegular?: boolean }
  ): Promise<Worker> {
    return this.workerRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const count = await this.workerRepo.countRecords(id);
    if (count > 0) {
      throw new WorkerDeleteError(
        "Cannot delete worker with existing records"
      );
    }
    await this.workerRepo.delete(id);
  }

  async getHistory(id: string): Promise<WorkerHistoryItem[]> {
    const records = await this.recordRepo.findByWorker(id);

    const weeksMap = new Map<
      string,
      {
        weekId: string;
        label: string;
        startDate: string;
        endDate: string;
        totalHours: number;
        totalEarnings: number;
        records: WorkerHistoryItem["records"];
      }
    >();

    for (const r of records) {
      const existing = weeksMap.get(r.weekId) || {
        weekId: r.weekId,
        label: r.week.label,
        startDate: this.weekCalc.formatDate(r.week.startDate),
        endDate: this.weekCalc.formatDate(r.week.endDate),
        totalHours: 0,
        totalEarnings: 0,
        records: [],
      };

      const total = this.calculator.recordTotal(r.hours, r.hourlyRate);
      existing.totalHours += r.hours;
      existing.totalEarnings += total;
      existing.records.push({
        id: r.id,
        date: this.weekCalc.formatDate(r.date),
        hours: r.hours,
        hourlyRate: r.hourlyRate,
        total,
        description: r.description,
      });

      weeksMap.set(r.weekId, existing);
    }

    return Array.from(weeksMap.values()).map((w) => ({
      ...w,
      totalHours: Math.round(w.totalHours * 100) / 100,
      totalEarnings: Math.round(w.totalEarnings * 100) / 100,
    }));
  }

  async getStats(id: string): Promise<WorkerStats> {
    const records = await this.recordRepo.findByWorker(id);

    if (records.length === 0) {
      return {
        totalHours: 0,
        totalEarnings: 0,
        weeksActive: 0,
        averageHoursPerWeek: 0,
        averageHourlyRate: 0,
      };
    }

    const weekIds = new Set(records.map((r) => r.weekId));
    const totalHours = records.reduce((s, r) => s + r.hours, 0);
    const totalEarnings = records.reduce(
      (s, r) => s + this.calculator.recordTotal(r.hours, r.hourlyRate),
      0
    );
    const avgRate =
      records.reduce((s, r) => s + r.hourlyRate, 0) / records.length;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      weeksActive: weekIds.size,
      averageHoursPerWeek: Math.round((totalHours / weekIds.size) * 100) / 100,
      averageHourlyRate: Math.round(avgRate * 100) / 100,
    };
  }

  async getDashboard(workerId: string): Promise<WorkerDashboard> {
    const records = await this.recordRepo.findByWorker(workerId);

    const weeksMap = new Map<
      string,
      WorkerDashboardItem
    >();

    for (const r of records) {
      const existing = weeksMap.get(r.weekId) || {
        weekId: r.weekId,
        label: r.week.label,
        startDate: this.weekCalc.formatDate(r.week.startDate),
        endDate: this.weekCalc.formatDate(r.week.endDate),
        totalHours: 0,
        totalEarnings: 0,
        status: r.week.status,
        recordCount: 0,
      };

      existing.totalHours = Math.round((existing.totalHours + r.hours) * 100) / 100;
      existing.totalEarnings = Math.round(
        (existing.totalEarnings + this.calculator.recordTotal(r.hours, r.hourlyRate)) * 100
      ) / 100;
      existing.recordCount += 1;

      weeksMap.set(r.weekId, existing);
    }

    const weeks = Array.from(weeksMap.values()).sort((a, b) => {
      const weekNumA = this.weekCalc.getWeekNumber(new Date(a.startDate));
      const weekNumB = this.weekCalc.getWeekNumber(new Date(b.startDate));
      return weekNumB - weekNumA;
    });

    const stats = await this.getStats(workerId);

    return { stats, weeks };
  }
}

export class WorkerDeleteError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "WorkerDeleteError";
  }
}
