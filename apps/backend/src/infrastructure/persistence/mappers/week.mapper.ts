import type { Week } from "../../../domain/entities/week.entity.js";

interface PrismaWeek {
  id: string;
  label: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
}

export class WeekMapper {
  static toDomain(prismaWeek: PrismaWeek): Week {
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
