import { Request, Response, NextFunction } from 'express';
import type { GenerateInvoicePdfUseCase } from '../../../application/use-cases/invoices/generate-invoice-pdf.use-case.js';
import type { InvoiceService } from '../../../domain/services/invoice.service.js';

interface InvoiceControllerDeps {
  generateInvoicePdf: GenerateInvoicePdfUseCase;
  invoiceService: InvoiceService;
}

export function createInvoiceController(deps: InvoiceControllerDeps) {
  return {
    async generatePdf(req: Request, res: Response, next: NextFunction) {
      try {
        const id = req.params.id as string;
        const { weekIds } = req.body;

        const invoiceData = await deps.generateInvoicePdf.execute({ workerId: id, weekIds });
        const pdfBuffer = deps.invoiceService.generatePdf(invoiceData);

        const filename = `invoice-${invoiceData.workerName.replace(/\s+/g, '_')}-${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
      } catch (err) {
        next(err);
      }
    },
  };
}