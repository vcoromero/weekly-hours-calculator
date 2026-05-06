import type { WeekRepository } from "../../domain/ports/week.repository.js";
import type { RecordRepository } from "../../domain/ports/record.repository.js";
import type { WorkerRepository } from "../../domain/ports/worker.repository.js";
import type {
  WeekWithTotals,
  WeekSummary,
  SaveWeekResult,
  WeekStatus,
} from "../../domain/models/week.js";
import type { Week } from "../../domain/models/week.js";
import type { CreateRecordInput } from "../../domain/models/work-record.js";
import { WeekCalculator } from "../../domain/services/week-calculator.js";
import { TotalsCalculator } from "../../domain/services/totals-calculator.js";

export class WeekApplicationService {
  constructor(
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
    private readonly workerRepo: WorkerRepository,
    private readonly weekCalc: WeekCalculator,
    private readonly totalsCalc: TotalsCalculator
  ) {}

  async getOrCreateCurrentWeek() {
    const range = this.weekCalc.getPreviousWeek();

    let week = await this.weekRepo.findByDateRange(range.start, range.end);

    if (!week) {
      week = await this.weekRepo.create({
        label: range.label,
        startDate: range.start,
        endDate: range.end,
      });
    }

    return week;
  }

  async getCurrentWeek(): Promise<WeekWithTotals> {
    const week = await this.getOrCreateCurrentWeek();
    const records = await this.recordRepo.findByWeek(week.id);
    return this.buildWeekWithTotals(week, records);
  }

  async listWeeks(): Promise<WeekSummary[]> {
    const weeks = await this.weekRepo.findAllSaved();

    // Sort by week number (descending - most recent first)
    const sortedWeeks = weeks.sort((a, b) => {
      const weekNumA = this.weekCalc.getWeekNumber(a.startDate);
      const weekNumB = this.weekCalc.getWeekNumber(b.startDate);
      return weekNumB - weekNumA;
    });

    const result: WeekSummary[] = [];
    for (const week of sortedWeeks) {
      const records = await this.recordRepo.findByWeekSimple(week.id);
      result.push({
        id: week.id,
        label: week.label,
        startDate: this.weekCalc.formatDate(week.startDate),
        endDate: this.weekCalc.formatDate(week.endDate),
        status: week.status as WeekStatus,
        totalRecords: records.length,
        totalAmount: this.totalsCalc.grandTotal(
          records.map((r) => ({
            workerId: r.workerId,
            workerName: "",
            totalHours: r.hours,
            totalAmount: r.hours * r.hourlyRate,
          }))
        ),
        createdAt: week.createdAt.toISOString(),
      });
    }

    return result;
  }

  async listAllWeeks(): Promise<Week[]> {
    const weeks = await this.weekRepo.findAll();
    return weeks.sort((a, b) => {
      const weekNumA = this.weekCalc.getWeekNumber(a.startDate);
      const weekNumB = this.weekCalc.getWeekNumber(b.startDate);
      return weekNumB - weekNumA;
    });
  }

  async previewWeek(
    weekId: string,
    records: CreateRecordInput[]
  ): Promise<WeekWithTotals> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    const workerIds = [...new Set(records.map((r) => r.workerId))];
    const allWorkers = await this.workerRepo.findAll();
    const workerNames = new Map(
      allWorkers
        .filter((w) => workerIds.includes(w.id))
        .map((w) => [w.id, w.name])
    );

    const totalsByWorker = this.totalsCalc.totalsByWorker(records, workerNames);

    return {
      id: week.id,
      label: week.label,
      startDate: this.weekCalc.formatDate(week.startDate),
      endDate: this.weekCalc.formatDate(week.endDate),
      status: week.status as WeekStatus,
      records: records.map((r) => ({
        id: "preview-" + crypto.randomUUID().slice(0, 8),
        workerId: r.workerId,
        workerName: workerNames.get(r.workerId) || "Unknown",
        date: r.date,
        hours: r.hours,
        hourlyRate: r.hourlyRate,
        total: this.totalsCalc.recordTotal(r.hours, r.hourlyRate),
        description: r.description || null,
      })),
      totalsByWorker,
      grandTotal: this.totalsCalc.grandTotal(totalsByWorker),
      createdAt: week.createdAt,
    };
  }

  async saveWeek(
    weekId: string,
    records: CreateRecordInput[]
  ): Promise<SaveWeekResult> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");
    if (week.status === "saved") throw new WeekError("Week is already saved");

    await this.replaceWeekRecords(weekId, records);

    await this.weekRepo.updateStatus(weekId, "saved");

    const savedRecords = await this.recordRepo.findByWeekSimple(weekId);
    const totalAmount = savedRecords.reduce(
      (sum, r) => sum + r.hours * r.hourlyRate,
      0
    );

    return {
      id: weekId,
      label: week.label,
      status: "saved",
      recordsCount: savedRecords.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  async getWeekDetail(weekId: string): Promise<WeekWithTotals> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    const records = await this.recordRepo.findByWeek(week.id);
    return this.buildWeekWithTotals(week, records);
  }

  async updateWeek(
    weekId: string,
    records: CreateRecordInput[]
  ): Promise<SaveWeekResult> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    await this.replaceWeekRecords(weekId, records);

    const updatedRecords = await this.recordRepo.findByWeekSimple(weekId);
    const totalAmount = updatedRecords.reduce(
      (sum, r) => sum + r.hours * r.hourlyRate,
      0
    );

    return {
      id: weekId,
      label: week.label,
      status: week.status as "draft" | "saved",
      recordsCount: updatedRecords.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  async deleteWeek(weekId: string): Promise<void> {
    const week = await this.weekRepo.findById(weekId);
    if (!week) throw new WeekError("Week not found");

    await this.weekRepo.delete(weekId);
  }

  private buildWeekWithTotals(
    week: Week,
    records: Array<{
      id: string;
      workerId: string;
      worker: { id: string; name: string };
      date: Date;
      hours: number;
      hourlyRate: number;
      description: string | null;
    }>
  ): WeekWithTotals {
    const workerNames = new Map<string, string>();
    const formattedRecords = records.map((r) => {
      workerNames.set(r.workerId, r.worker.name);
      return {
        id: r.id,
        workerId: r.workerId,
        workerName: r.worker.name,
        date: this.weekCalc.formatDate(r.date),
        hours: r.hours,
        hourlyRate: r.hourlyRate,
        total: this.totalsCalc.recordTotal(r.hours, r.hourlyRate),
        description: r.description,
      };
    });

    const totalsByWorker = this.totalsCalc.totalsByWorker(records, workerNames);

    return {
      id: week.id,
      label: week.label,
      startDate: this.weekCalc.formatDate(week.startDate),
      endDate: this.weekCalc.formatDate(week.endDate),
      status: week.status as WeekStatus,
      records: formattedRecords,
      totalsByWorker,
      grandTotal: this.totalsCalc.grandTotal(totalsByWorker),
      createdAt: week.createdAt,
    };
  }

  private async replaceWeekRecords(
    weekId: string,
    records: CreateRecordInput[]
  ): Promise<void> {
    await this.recordRepo.deleteByWeek(weekId);

    await this.recordRepo.createMany(
      records.map((r) => ({
        ...r,
        weekId,
        description: r.description || undefined,
      }))
    );
  }
}

export class WeekError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "WeekError";
  }
}
