import { prisma } from "./prisma-client.js";
import type {
  RecordRepository,
  RecordWithWorker,
} from "../../../domain/ports/record.repository.js";
import type { WorkRecord, CreateRecordInput } from "../../../domain/models/work-record.js";

export class RecordPrismaRepository implements RecordRepository {
  async create(
    data: CreateRecordInput & { weekId: string }
  ): Promise<WorkRecord> {
    const record = await prisma.workRecord.create({
      data: {
        workerId: data.workerId,
        date: new Date(data.date),
        hours: data.hours,
        hourlyRate: data.hourlyRate,
        description: data.description || null,
        weekId: data.weekId,
      },
    });
    return this.mapSimple(record);
  }

  async findByWeek(weekId: string): Promise<RecordWithWorker[]> {
    const records = await prisma.workRecord.findMany({
      where: { weekId },
      include: { worker: true, week: true },
      orderBy: [{ worker: { name: "asc" } }, { date: "asc" }],
    });
    return records.map((r) => this.mapFull(r));
  }

  async findByWorker(workerId: string): Promise<RecordWithWorker[]> {
    const records = await prisma.workRecord.findMany({
      where: { workerId },
      include: { worker: true, week: true },
      orderBy: { date: "desc" },
    });
    return records.map((r) => this.mapFull(r));
  }

  async findById(id: string): Promise<RecordWithWorker | null> {
    const record = await prisma.workRecord.findUnique({
      where: { id },
      include: { worker: true, week: true },
    });
    return record ? this.mapFull(record) : null;
  }

  async findDuplicate(data: {
    workerId: string;
    date: string;
    hours: number;
    hourlyRate: number;
    weekId: string;
  }): Promise<WorkRecord | null> {
    const record = await prisma.workRecord.findFirst({
      where: {
        workerId: data.workerId,
        date: new Date(data.date),
        hours: data.hours,
        hourlyRate: data.hourlyRate,
        weekId: data.weekId,
      },
    });
    return record ? this.mapSimple(record) : null;
  }

  async delete(id: string): Promise<void> {
    await prisma.workRecord.delete({ where: { id } });
  }

  async deleteByWeek(weekId: string): Promise<void> {
    await prisma.workRecord.deleteMany({ where: { weekId } });
  }

  async createMany(
    data: Array<CreateRecordInput & { weekId: string }>
  ): Promise<void> {
    await prisma.workRecord.createMany({
      data: data.map((r) => ({
        workerId: r.workerId,
        date: new Date(r.date),
        hours: r.hours,
        hourlyRate: r.hourlyRate,
        description: r.description || null,
        weekId: r.weekId,
      })),
    });
  }

  async findByWeekSimple(weekId: string): Promise<WorkRecord[]> {
    const records = await prisma.workRecord.findMany({
      where: { weekId },
    });
    return records.map((r) => this.mapSimple(r));
  }

  private mapSimple(record: {
    id: string;
    workerId: string;
    date: Date;
    hours: number;
    hourlyRate: number;
    description: string | null;
    weekId: string;
    createdAt: Date;
  }): WorkRecord {
    return {
      id: record.id,
      workerId: record.workerId,
      date: record.date,
      hours: record.hours,
      hourlyRate: record.hourlyRate,
      description: record.description,
      weekId: record.weekId,
      createdAt: record.createdAt,
    };
  }

  private mapFull(record: {
    id: string;
    workerId: string;
    date: Date;
    hours: number;
    hourlyRate: number;
    description: string | null;
    weekId: string;
    createdAt: Date;
    worker: { id: string; name: string };
    week: {
      id: string;
      label: string;
      startDate: Date;
      endDate: Date;
      status: string;
    };
  }): RecordWithWorker {
    return {
      id: record.id,
      workerId: record.workerId,
      date: record.date,
      hours: record.hours,
      hourlyRate: record.hourlyRate,
      description: record.description,
      weekId: record.weekId,
      createdAt: record.createdAt,
      worker: record.worker,
      week: record.week,
    };
  }
}
