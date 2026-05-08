import { jsPDF } from 'jspdf';
import type { InvoiceDataDto } from '../../application/dto/invoices/invoice-data.dto.js';

const COL_X = {
  fecha: 20,
  horas: 80,
  costo: 115,
  total: 150,
};

export class InvoiceService {
  generatePdf(data: InvoiceDataDto): Buffer {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    let yPos = 20;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Factura de Pago', 20, yPos);
    yPos += 12;

    doc.setFontSize(11);
    doc.text(`Trabajador: ${data.workerName}`, 20, yPos);
    yPos += 7;

    doc.text(
      `Fecha de emisión: ${data.generatedAt.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
      20,
      yPos
    );
    yPos += 15;

    for (let weekIdx = 0; weekIdx < data.weeks.length; weekIdx++) {
      const week = data.weeks[weekIdx];

      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(week.label, 20, yPos);
      yPos += 8;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Fecha', COL_X.fecha, yPos);
      doc.text('Horas', COL_X.horas, yPos);
      doc.text('Costo/h', COL_X.costo, yPos);
      doc.text('Total', COL_X.total, yPos);
      yPos += 2;

      doc.setDrawColor(180);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'normal');

      for (const record of week.records) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        const desc = record.description ? record.description.substring(0, 40) : '';
        doc.text(record.date, COL_X.fecha, yPos);
        doc.text(String(record.hours), COL_X.horas, yPos);
        doc.text(`$${record.hourlyRate.toFixed(2)}`, COL_X.costo, yPos);
        doc.text(`$${record.total.toFixed(2)}`, COL_X.total, yPos);
        yPos += 5;

        if (desc) {
          doc.setFontSize(8);
          doc.setTextColor(120);
          doc.text(desc, COL_X.fecha + 5, yPos);
          doc.setTextColor(0);
          doc.setFontSize(9);
          yPos += 4;
        }
      }

      yPos += 2;
      doc.setDrawColor(180);
      doc.line(COL_X.fecha, yPos, pageWidth - 20, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', COL_X.costo, yPos);
      doc.text(`${week.totalHours}h`, COL_X.horas, yPos);
      doc.text(`$${week.totalAmount.toFixed(2)}`, COL_X.total, yPos);
      yPos += 10;

      if (weekIdx < data.weeks.length - 1) {
        doc.setDrawColor(200);
        doc.line(20, yPos, pageWidth - 20, yPos);
        yPos += 8;
      }
    }

    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 4;
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 8;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('GRAN TOTAL', 20, yPos);
    doc.text(`${data.grandTotalHours}h`, COL_X.horas, yPos);
    doc.text(`$${data.grandTotalAmount.toFixed(2)}`, COL_X.total, yPos);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }
}