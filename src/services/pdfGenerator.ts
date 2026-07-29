import jsPDF from 'jspdf';
import { ScannedDocument, PdfExportOptions } from '../types';

export const DEFAULT_PDF_OPTIONS: PdfExportOptions = {
  pageSize: 'a4',
  orientation: 'portrait',
  margin: 'small',
  quality: 0.9,
  includeWatermark: true,
  watermarkText: 'Document Scanner • Nguyễn Trung Tín (SĐT: 0977 530 943 - Email: trungtin8881@gmail.com)',
  pdfTitle: '',
  authorName: 'Nguyễn Trung Tín (0977 530 943)'
};

export async function generateDocumentPdf(
  doc: ScannedDocument,
  customOptions?: Partial<PdfExportOptions>
): Promise<jsPDF> {
  const opts: PdfExportOptions = {
    ...DEFAULT_PDF_OPTIONS,
    ...customOptions,
    pdfTitle: customOptions?.pdfTitle || doc.title || 'Document'
  };

  // Dimensions in mm
  let pdfWidth = 210; // A4 default width
  let pdfHeight = 297; // A4 default height

  if (opts.pageSize === 'letter') {
    pdfWidth = 215.9;
    pdfHeight = 279.4;
  }

  const pdf = new jsPDF({
    orientation: opts.orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: opts.pageSize === 'letter' ? 'letter' : 'a4'
  });

  // Set Metadata
  pdf.setProperties({
    title: opts.pdfTitle,
    author: opts.authorName,
    subject: `Scanned Document - ${doc.category}`,
    creator: 'Document Scanner by Nguyễn Trung Tín',
    keywords: doc.tags ? doc.tags.join(', ') : ''
  });

  let marginMm = 5; // default 'small'
  if (opts.margin === 'none') marginMm = 0;
  if (opts.margin === 'normal') marginMm = 12;

  const totalPages = doc.pages.length;

  for (let i = 0; i < totalPages; i++) {
    const page = doc.pages[i];
    const imgDataUrl = page.processedImageDataUrl || page.originalImageDataUrl;

    if (i > 0) {
      pdf.addPage();
    }

    // Load image element to calculate dimensions
    const imgInfo = await getImageDimensions(imgDataUrl);

    let orientation = opts.orientation;
    if (orientation === 'auto') {
      orientation = imgInfo.width > imgInfo.height ? 'landscape' : 'portrait';
    }

    const availWidth = pdfWidth - marginMm * 2;
    const availHeight = pdfHeight - marginMm * 2 - (opts.includeWatermark ? 8 : 0);

    // Calculate aspect ratio fit
    const imgAspect = imgInfo.width / imgInfo.height;
    let renderW = availWidth;
    let renderH = availWidth / imgAspect;

    if (renderH > availHeight) {
      renderH = availHeight;
      renderW = availHeight * imgAspect;
    }

    const posX = marginMm + (availWidth - renderW) / 2;
    const posY = marginMm + (availHeight - renderH) / 2;

    // Add image to PDF page
    pdf.addImage(imgDataUrl, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');

    // Add Watermark & Page Numbering if enabled
    if (opts.includeWatermark) {
      pdf.setFontSize(8);
      pdf.setTextColor(120, 120, 120);

      // Watermark footer text
      const footerText = opts.watermarkText || 'Document Scanner • By Nguyễn Trung Tín';
      pdf.text(footerText, marginMm, pdfHeight - 4);

      // Page X of Y
      const pageStr = `Trang ${i + 1} / ${totalPages}`;
      pdf.text(pageStr, pdfWidth - marginMm, pdfHeight - 4, { align: 'right' });
    }
  }

  return pdf;
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 1100 });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 1100 });
    };
    img.src = dataUrl;
  });
}

export async function downloadDocumentPdf(
  doc: ScannedDocument,
  customOptions?: Partial<PdfExportOptions>
): Promise<void> {
  const pdf = await generateDocumentPdf(doc, customOptions);
  const cleanTitle = (doc.title || 'Tai_Lieu_Quet')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  pdf.save(`${cleanTitle}_NguyenTrungTin.pdf`);
}

export async function getPdfBlobUrl(
  doc: ScannedDocument,
  customOptions?: Partial<PdfExportOptions>
): Promise<string> {
  const pdf = await generateDocumentPdf(doc, customOptions);
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}
