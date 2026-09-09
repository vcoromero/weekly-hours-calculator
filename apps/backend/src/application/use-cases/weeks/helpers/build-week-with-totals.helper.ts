import type { Week } from "../../../../domain/entities/week.entity.js";
import type { RecordWithWorker } from "../../../../domain/ports/record.repository.js";
import type { WeekCalculator } from "../../../../domain/services/week-calculator.js";
import type { TotalsCalculator } from "../../../../domain/services/totals-calculator.js";
import type { WeekWithTotalsDto } from "../../../dto/weeks/week-with-totals.dto.js";
import type { WeekStatus } from "../../../../domain/value-objects/week-status.vo.js";
import type { WorkerPayment } from "../../../../domain/entities/worker-payment.entity.js";

export class BuildWeekWithTotalsHelper {
  static execute(
    week: Week,
    records: RecordWithWorker[],
    weekCalc: WeekCalculator,
    totalsCalc: TotalsCalculator,
    payments: WorkerPayment[] = [],
  ): WeekWithTotalsDto {
    const workerNames = new Map<string, string>();
    const formattedRecords = records.map((r) => {
      workerNames.set(r.workerId, r.worker.name);
      return {
        id: r.id,
        workerId: r.workerId,
        workerName: r.worker.name,
        date: weekCalc.formatDate(r.date),
        hours: r.hours,
        hourlyRate: r.hourlyRate,
        total: totalsCalc.recordTotal(r.hours, r.hourlyRate),
        description: r.description,
        daySavedAt: r.daySavedAt?.toISOString() ?? null,
      };
    });

    const totalsByWorker = totalsCalc.totalsByWorker(records, workerNames);

    return {
      id: week.id,
      label: week.label,
      startDate: weekCalc.formatDate(week.startDate),
      endDate: weekCalc.formatDate(week.endDate),
      status: week.status as WeekStatus,
      records: formattedRecords,
      totalsByWorker,
      grandTotal: totalsCalc.grandTotal(totalsByWorker),
      createdAt: week.createdAt,
      payments: payments.map((p) => ({
        workerId: p.workerId,
        paidAt: p.paidAt.toISOString(),
      })),
    };
  }
}
