import type { WorkerRepository } from '../../../domain/ports/worker.repository.js';
import type { WeekRepository } from '../../../domain/ports/week.repository.js';
import type { RecordRepository } from '../../../domain/ports/record.repository.js';
import type { WorkerPaymentRepository } from '../../../domain/ports/worker-payment.repository.js';
import { InvoiceError } from '../../../domain/errors/invoice.error.js';
import type { InvoiceDataDto, InvoiceRecordData } from '../../dto/invoices/index.js';
import type { GenerateInvoiceInput } from '../../dto/invoices/index.js';

export class GenerateInvoicePdfUseCase {
  constructor(
    private readonly workerRepo: WorkerRepository,
    private readonly weekRepo: WeekRepository,
    private readonly recordRepo: RecordRepository,
    private readonly paymentRepo: WorkerPaymentRepository,
  ) {}

  async execute(input: GenerateInvoiceInput): Promise<InvoiceDataDto> {
    const { workerId, weekIds } = input;

    const worker = await this.workerRepo.findById(workerId);
    if (!worker) {
      throw new InvoiceError('Worker not found');
    }

    if (!weekIds || weekIds.length === 0) {
      throw new InvoiceError('At least one week must be selected');
    }

    if (weekIds.length > 2) {
      throw new InvoiceError('Maximum 2 weeks per invoice');
    }

    const weeks = await Promise.all(
      weekIds.map(async (id) => {
        const week = await this.weekRepo.findById(id);
        if (!week) {
          throw new InvoiceError(`Week ${id} not found`);
        }
        if (week.status !== 'saved') {
          throw new InvoiceError(`Week "${week.label}" is not saved`);
        }
        return week;
      }),
    );

    const existingPayments = await this.paymentRepo.findByWorkerAndWeeks(workerId, weekIds);
    if (existingPayments.length > 0) {
      throw new InvoiceError('One or more weeks are already paid for this worker');
    }

    const weekData: InvoiceDataDto['weeks'] = [];

    for (const week of weeks) {
      const records = await this.recordRepo.findByWeek(week.id);
      const workerRecords = records.filter((r) => r.workerId === workerId);

      if (workerRecords.length === 0) {
        throw new InvoiceError(`No records found for worker in week "${week.label}"`);
      }

      const totalHours = workerRecords.reduce((sum, r) => sum + r.hours, 0);
      const totalAmount = workerRecords.reduce((sum, r) => sum + r.hours * r.hourlyRate, 0);

      const recordData: InvoiceRecordData[] = workerRecords
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((r) => ({
          date: new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          hours: Math.round(r.hours * 100) / 100,
          hourlyRate: Math.round(r.hourlyRate * 100) / 100,
          total: Math.round(r.hours * r.hourlyRate * 100) / 100,
          description: r.description,
        }));

      weekData.push({
        weekId: week.id,
        label: week.label,
        startDate: week.startDate.toISOString().slice(0, 10),
        endDate: week.endDate.toISOString().slice(0, 10),
        records: recordData,
        totalHours: Math.round(totalHours * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
      });
    }

    const grandTotalHours = weekData.reduce((sum, w) => sum + w.totalHours, 0);
    const grandTotalAmount = weekData.reduce((sum, w) => sum + w.totalAmount, 0);

    return {
      workerName: worker.name,
      generatedAt: new Date(),
      weeks: weekData,
      grandTotalHours: Math.round(grandTotalHours * 100) / 100,
      grandTotalAmount: Math.round(grandTotalAmount * 100) / 100,
    };
  }
}