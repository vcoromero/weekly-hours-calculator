import type { PrismaClient } from "@prisma/client";
import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { Week } from "../../../domain/entities/week.entity.js";
import { WeekMapper } from "../mappers/week.mapper.js";

export class WeekPrismaRepository implements WeekRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Week | null> {
    const week = await this.prisma.week.findUnique({ where: { id } });
    return week ? WeekMapper.toDomain(week) : null;
  }

  async findByDateRange(start: Date, end: Date): Promise<Week | null> {
    const week = await this.prisma.week.findFirst({
      where: { startDate: start, endDate: end },
    });
    return week ? WeekMapper.toDomain(week) : null;
  }

  async create(data: {
    label: string;
    startDate: Date;
    endDate: Date;
  }): Promise<Week> {
    const week = await this.prisma.week.create({
      data: {
        label: data.label,
        startDate: data.startDate,
        endDate: data.endDate,
        status: "draft",
      },
    });
    return WeekMapper.toDomain(week);
  }

  async updateStatus(id: string, status: string): Promise<Week> {
    const week = await this.prisma.week.update({
      where: { id },
      data: { status },
    });
    return WeekMapper.toDomain(week);
  }

  async findAllSaved(): Promise<Week[]> {
    const weeks = await this.prisma.week.findMany({
      where: { status: "saved" },
      orderBy: { startDate: "desc" },
    });
    return weeks.map(WeekMapper.toDomain);
  }

  async findAllSavedPaginated(skip: number, take: number): Promise<{ weeks: Week[]; total: number }> {
    const [weeks, total] = await Promise.all([
      this.prisma.week.findMany({
        where: { status: "saved" },
        orderBy: { startDate: "desc" },
        skip,
        take,
      }),
      this.prisma.week.count({ where: { status: "saved" } }),
    ]);
    return { weeks: weeks.map(WeekMapper.toDomain), total };
  }

  async findAll(): Promise<Week[]> {
    const weeks = await this.prisma.week.findMany({
      orderBy: { startDate: "desc" },
    });
    return weeks.map(WeekMapper.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.week.delete({ where: { id } });
  }
}
