import { prisma } from "./prisma-client.js";
import type { WeekRepository } from "../../../domain/ports/week.repository.js";
import type { Week } from "../../../domain/models/week.js";

export class WeekPrismaRepository implements WeekRepository {
  async findById(id: string): Promise<Week | null> {
    const week = await prisma.week.findUnique({ where: { id } });
    return week ? this.map(week) : null;
  }

  async findByDateRange(start: Date, end: Date): Promise<Week | null> {
    const week = await prisma.week.findFirst({
      where: { startDate: start, endDate: end },
    });
    return week ? this.map(week) : null;
  }

  async create(data: {
    label: string;
    startDate: Date;
    endDate: Date;
  }): Promise<Week> {
    const week = await prisma.week.create({
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
    const week = await prisma.week.update({
      where: { id },
      data: { status },
    });
    return this.map(week);
  }

  async findAllSaved(): Promise<Week[]> {
    const weeks = await prisma.week.findMany({
      where: { status: "saved" },
      orderBy: { startDate: "desc" },
    });
    return weeks.map((w) => this.map(w));
  }

  async findAll(): Promise<Week[]> {
    const weeks = await prisma.week.findMany({
      orderBy: { startDate: "desc" },
    });
    return weeks.map((w) => this.map(w));
  }

  async delete(id: string): Promise<void> {
    await prisma.week.delete({ where: { id } });
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
