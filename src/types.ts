export type PageFilter = 'original' | 'magic' | 'bw' | 'grayscale' | 'contrast';

export interface FilterSettings {
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  saturation: number; // -100 to 100
  sharpness: number;  // 0 to 100
  rotation: number;   // 0, 90, 180, 270
}

export interface CropPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface CropPolygon {
  topLeft: CropPoint;
  topRight: CropPoint;
  bottomRight: CropPoint;
  bottomLeft: CropPoint;
}

export interface DocumentPage {
  id: string;
  pageNumber: number;
  originalImageDataUrl: string;
  processedImageDataUrl: string;
  filter: PageFilter;
  filterSettings: FilterSettings;
  cropPolygon?: CropPolygon;
  width: number;
  height: number;
  ocrText?: string;
}

export type DocumentCategory =
  | 'all'
  | 'work'
  | 'personal'
  | 'invoices'
  | 'contracts'
  | 'ids'
  | 'notes'
  | 'academic'
  | 'uncategorized';

export interface ScannedDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  tags: string[];
  pages: DocumentPage[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  fileSizeEstimate: string; // e.g. "1.2 MB"
  ocrText?: string;
  summary?: string;
  authorNote?: string;
  isFavorite?: boolean;
}

export interface PdfExportOptions {
  pageSize: 'a4' | 'letter' | 'auto';
  orientation: 'portrait' | 'landscape' | 'auto';
  margin: 'none' | 'small' | 'normal';
  quality: number; // 0.1 to 1.0
  includeWatermark: boolean; // "Scanned with Document Scanner - By Nguyễn Trung Tín"
  watermarkText: string;
  pdfTitle: string;
  authorName: string;
}

export interface AuthorProfile {
  name: string;
  phone: string;
  contactEmail: string;
  title: string;
  signature: string;
  description: string;
  version: string;
  appTitle: string;
  isProduction: boolean;
}

export const APP_AUTHOR_PROFILE: AuthorProfile = {
  name: "Nguyễn Trung Tín",
  phone: "0977 530 943",
  contactEmail: "trungtin8881@gmail.com",
  title: "Kỹ sư phát triển phần mềm / Full Stack Developer",
  signature: "Designed & Built by Nguyễn Trung Tín • 0977 530 943",
  description: "Ứng dụng quét tài liệu đa năng chính thức, xử lý hình ảnh trực tiếp trên trình duyệt, chuyển đổi PDF sắc nét chuẩn ngân hàng và tích hợp AI OCR thông minh.",
  version: "1.0.0 (Bản Thật - Production)",
  appTitle: "Document Scanner",
  isProduction: true
};
