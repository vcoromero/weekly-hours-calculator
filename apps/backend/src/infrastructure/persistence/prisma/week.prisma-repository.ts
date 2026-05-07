import type { PrismaClient } from "@prisma/client";
import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { Week } from "../../../domain/entities/week.entity.js";

export class WeekPrismaRepository implements WeekRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Week | null> {
    const week = await this.prisma.week.findUnique({ where: { id } });
    return week ? this.map(week) : null;
  }

  async findByDateRange(start: Date, end: Date): Promise<Week | null> {
    const week = await this.prisma.week.findFirst({
      where: { startDate: start, endDate: end },
    });
    return week ? this.map(week) : null;
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
    return this.map(week);
  }

  async updateStatus(id: string, status: string): Promise<Week> {
    const week = await this.prisma.week.update({
      where: { id },
      data: { status },
    });
    return this.map(week);
  }

  async findAllSaved(): Promise<Week[]> {
    const weeks = await this.prisma.week.findMany({
      where: { status: "saved" },
      orderBy: { startDate: "desc" },
    });
    return weeks.map((w) => this.map(w));
  }

  async findAll(): Promise<Week[]> {
    const weeks = await this.prisma.week.findMany({
      orderBy: { startDate: "desc" },
    });
    return weeks.map((w) => this.map(w));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.week.delete({ where: { id } });
  }

  private map(prismaWeek: {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    status: string;
    createdAt: Date;
  }): Week {
    return {
      id: prismaWeek.id,
      label: prismaWeek.label,
      startDate: prismaWeek.startDate,
      endDate: prismaWeek.endDate,
      status: prismaWeek.status as "draft" | "saved",
      createdAt: prismaWeek.createdAt,
    };
  }
}
