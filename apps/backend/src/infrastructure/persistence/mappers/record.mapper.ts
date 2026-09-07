import type { WorkRecord } from "../../../domain/entities/work-record.entity.js";
import type { RecordWithWorker } from "../../../domain/ports/record.repository.js";

interface PrismaRecordSimple {
  id: string;
  workerId: string;
  date: Date;
  hours: number;
  hourlyRate: number;
  description: string | null;
  weekId: string;
  dayLockedAt: Date | null;
  createdAt: Date;
}

interface PrismaRecordFull extends PrismaRecordSimple {
  worker: { id: string; name: string };
  week: {
    id: string;
    label: string;
    startDate: Date;
    endDate: Date;
    status: string;
  };
}

export class RecordMapper {
  static toDomain(prismaRecord: PrismaRecordSimple): WorkRecord {
    return {
      id: prismaRecord.id,
      workerId: prismaRecord.workerId,
      date: prismaRecord.date,
      hours: prismaRecord.hours,
      hourlyRate: prismaRecord.hourlyRate,
      description: prismaRecord.description,
      weekId: prismaRecord.weekId,
      dayLockedAt: prismaRecord.dayLockedAt,
      createdAt: prismaRecord.createdAt,
    };
  }

  static toDomainWithWorker(prismaRecord: PrismaRecordFull): RecordWithWorker {
    return {
      id: prismaRecord.id,
      workerId: prismaRecord.workerId,
      date: prismaRecord.date,
      hours: prismaRecord.hours,
      hourlyRate: prismaRecord.hourlyRate,
      description: prismaRecord.description,
      weekId: prismaRecord.weekId,
      dayLockedAt: prismaRecord.dayLockedAt,
      createdAt: prismaRecord.createdAt,
      worker: prismaRecord.worker,
      week: prismaRecord.week,
    };
  }
}
