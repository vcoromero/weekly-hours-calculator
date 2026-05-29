import { jsPDF } from 'jspdf';
import * as fs from 'fs';
import * as path from 'path';
import type { InvoiceDataDto } from '../../application/dto/invoices/invoice-data.dto.js';

const COLORS = {
  darkBlue: '#042d79',
  mediumBlue: '#042d79',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#787878',
};

const COL_X = {
  date: 20,
  hours: 80,
  rate: 115,
  total: 150,
};

const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210;

export class InvoiceService {
  private loadBanner(doc: jsPDF): { imgData: string; imgW: number; imgH: number } | null {
    try {
      const bannerPath = path.join(process.cwd(), 'assets', 'banner.jpeg');
      if (!fs.existsSync(bannerPath)) {
        return null;
      }
      const imgData = fs.readFileSync(bannerPath).toString('base64');
      const dataUri = `data:image/jpeg;base64,${imgData}`;
      const props = doc.getImageProperties(dataUri);
      const maxWidth = PAGE_WIDTH - PAGE_MARGIN * 2;
      const scale = maxWidth / props.width;
      const imgW = maxWidth;
      const imgH = props.height * scale;
      return { imgData: dataUri, imgW, imgH };
    } catch {
      return null;
    }
  }

  generatePdf(data: InvoiceDataDto): Buffer {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = PAGE_MARGIN;

    const banner = this.loadBanner(doc);
    if (banner) {
      doc.addImage(banner.imgData, 'JPEG', PAGE_MARGIN, yPos, banner.imgW, banner.imgH);
      yPos += banner.imgH + 10;
    }

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.black);
    doc.text('Payment Invoice', PAGE_MARGIN, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.black);
    doc.text('Worker: ', PAGE_MARGIN, yPos);
    const workerLabelWidth = doc.getTextWidth('Worker: ');
    doc.setTextColor(COLORS.mediumBlue);
    doc.text(data.workerName, PAGE_MARGIN + workerLabelWidth, yPos);
    yPos += 7;

    doc.setTextColor(COLORS.black);
    doc.text('Issue Date: ', PAGE_MARGIN, yPos);
    const dateLabelWidth = doc.getTextWidth('Issue Date: ');
    const dateStr = data.generatedAt.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.setTextColor(COLORS.mediumBlue);
    doc.text(dateStr, PAGE_MARGIN + dateLabelWidth, yPos);
    yPos += 14;

    for (let weekIdx = 0; weekIdx < data.weeks.length; weekIdx++) {
      const week = data.weeks[weekIdx];

      if (yPos > 250) {
        doc.addPage();
        yPos = PAGE_MARGIN;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.black);
      doc.text(week.label, PAGE_MARGIN, yPos);
      yPos += 8;

      doc.setFillColor(COLORS.darkBlue);
      doc.rect(PAGE_MARGIN, yPos - 5, pageWidth - PAGE_MARGIN * 2, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.white);
      doc.text('Date', COL_X.date, yPos);
      doc.text('Hours', COL_X.hours, yPos);
      doc.text('Rate/h', COL_X.rate, yPos);
      doc.text('Amount', COL_X.total, yPos);
      yPos += 5;

      doc.setDrawColor(180);
      doc.line(PAGE_MARGIN, yPos - 1, pageWidth - PAGE_MARGIN, yPos - 1);
      yPos += 3;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.black);

      for (const record of week.records) {
        if (yPos > 270) {
          doc.addPage();
          yPos = PAGE_MARGIN;
          doc.setFillColor(COLORS.darkBlue);
          doc.rect(PAGE_MARGIN, yPos - 5, pageWidth - PAGE_MARGIN * 2, 7, 'F');
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(COLORS.white);
          doc.text('Date', COL_X.date, yPos);
          doc.text('Hours', COL_X.hours, yPos);
          doc.text('Rate/h', COL_X.rate, yPos);
          doc.text('Amount', COL_X.total, yPos);
          yPos += 5;
          doc.setDrawColor(180);
          doc.line(PAGE_MARGIN, yPos - 1, pageWidth - PAGE_MARGIN, yPos - 1);
          yPos += 3;
        }

        const desc = record.description ? record.description.substring(0, 40) : '';
        doc.text(record.date, COL_X.date, yPos);
        doc.text(String(record.hours), COL_X.hours, yPos);
        doc.text(`$${record.hourlyRate.toFixed(2)}`, COL_X.rate, yPos);
        doc.text(`$${record.total.toFixed(2)}`, COL_X.total, yPos);
        yPos += 5;

        if (desc) {
          doc.setFontSize(8);
          doc.setTextColor(COLORS.gray);
          doc.text(desc, COL_X.date + 5, yPos);
          doc.setTextColor(COLORS.black);
          doc.setFontSize(9);
          yPos += 4;
        }
      }

      yPos += 2;
      doc.setDrawColor(180);
      doc.line(COL_X.date, yPos, pageWidth - PAGE_MARGIN, yPos);
      yPos += 4;

      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', COL_X.rate, yPos);
      doc.text(`${week.totalHours}h`, COL_X.hours, yPos);
      doc.text(`$${week.totalAmount.toFixed(2)}`, COL_X.total, yPos);
      yPos += 10;

      if (weekIdx < data.weeks.length - 1) {
        doc.setDrawColor(200);
        doc.line(PAGE_MARGIN, yPos, pageWidth - PAGE_MARGIN, yPos);
        yPos += 8;
      }
    }

    if (yPos > 260) {
      doc.addPage();
      yPos = PAGE_MARGIN;
    }

    yPos += 4;
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    doc.line(PAGE_MARGIN, yPos, pageWidth - PAGE_MARGIN, yPos);
    yPos += 8;

    doc.setFillColor(COLORS.darkBlue);
    doc.rect(PAGE_MARGIN, yPos - 3, pageWidth - PAGE_MARGIN * 2, 9, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.white);
    doc.text('Total', PAGE_MARGIN + 2, yPos + 3);
    doc.text(`${data.grandTotalHours}h`, COL_X.hours, yPos + 3);
    doc.text(`$${data.grandTotalAmount.toFixed(2)}`, COL_X.total, yPos + 3);

    const pageCount = doc.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 30;

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(180);
      doc.setLineWidth(0.3);
      doc.line(PAGE_MARGIN, footerY - 5, pageWidth - PAGE_MARGIN, footerY - 5);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.mediumBlue);
      doc.text('www.jazminscleanings.com', PAGE_MARGIN, footerY);
      doc.text('(754) 213-3527', PAGE_MARGIN, footerY + 4);
      doc.text('3013 NW 68th St Fort Lauderdale, FL, 33309-1344', PAGE_MARGIN, footerY + 8);
      doc.text('contact@jazminscleanings.com', PAGE_MARGIN, footerY + 12);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    return pdfBuffer;
  }
}