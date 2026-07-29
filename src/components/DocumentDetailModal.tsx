import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  Mail,
  Sparkles,
  Edit,
  FileText,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  UserCheck
} from 'lucide-react';
import { ScannedDocument, PdfExportOptions, APP_AUTHOR_PROFILE } from '../types';
import { downloadDocumentPdf, getPdfBlobUrl } from '../services/pdfGenerator';

interface DocumentDetailModalProps {
  document: ScannedDocument;
  onClose: () => void;
  onEditDocument: (doc: ScannedDocument) => void;
  onOpenOcrModal: (doc: ScannedDocument) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document,
  onClose,
  onEditDocument,
  onOpenOcrModal
}) => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showShareSuccess, setShowShareSuccess] = useState<boolean>(false);

  useEffect(() => {
    let currentUrl: string | null = null;

    const generatePreview = async () => {
      const url = await getPdfBlobUrl(document, {
        pageSize,
        orientation,
        includeWatermark,
        watermarkText: `Scanned with Document Scanner • By Nguyễn Trung Tín`
      });
      currentUrl = url;
      setPdfPreviewUrl(url);
    };

    generatePreview();

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [document, includeWatermark, pageSize, orientation]);

  const currentPage = document.pages[activePageIndex];

  const handleDownloadPdf = async () => {
    await downloadDocumentPdf(document, {
      pageSize,
      orientation,
      includeWatermark,
      watermarkText: `Scanned with Document Scanner • By Nguyễn Trung Tín`
    });
  };

  const handlePrint = () => {
    if (!pdfPreviewUrl) return;
    const printWindow = window.open(pdfPreviewUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`[Tài liệu quét] ${document.title}`);
    const body = encodeURIComponent(
      `Chào bạn,\n\nTài liệu "${document.title}" (${document.pages.length} trang) đã được quét và tạo bằng ứng dụng Document Scanner - Phát triển bởi ${APP_AUTHOR_PROFILE.name}.\n\nTrân trọng.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">{document.title}</h2>
              <p className="text-xs text-slate-400 flex items-center space-x-1.5">
                <span>{document.pages.length} trang</span>
                <span>•</span>
                <span className="text-blue-300 font-semibold">BY NGUYỄN TRUNG TÍN</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onEditDocument(document)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <Edit className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Chỉnh Sửa</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main View Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* PDF / Image Stage Column */}
          <div className="lg:col-span-8 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-between overflow-y-auto min-h-[400px]">
            {pdfPreviewUrl ? (
              <iframe
                src={pdfPreviewUrl}
                title="Xem trước PDF"
                className="w-full h-[460px] sm:h-[520px] rounded-2xl border border-slate-800 shadow-2xl bg-slate-900"
              />
            ) : currentPage ? (
              <img
                src={currentPage.processedImageDataUrl || currentPage.originalImageDataUrl}
                alt={`Trang ${activePageIndex + 1}`}
                className="max-h-[500px] w-auto object-contain rounded-xl border border-slate-800 shadow-2xl"
              />
            ) : null}

            {/* Page Navigator Bar */}
            {document.pages.length > 1 && (
              <div className="flex items-center space-x-4 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl mt-4">
                <button
                  onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
                  disabled={activePageIndex === 0}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-slate-300">
                  Trang {activePageIndex + 1} / {document.pages.length}
                </span>
                <button
                  onClick={() => setActivePageIndex(Math.min(document.pages.length - 1, activePageIndex + 1))}
                  disabled={activePageIndex === document.pages.length - 1}
                  className="p-1.5 text-slate-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right Control & Export Column */}
          <div className="lg:col-span-4 p-5 space-y-5 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 overflow-y-auto">
            {/* Quick Export Actions */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Xuất & Tải Về</h3>

              <button
                onClick={handleDownloadPdf}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Tải PDF Xuống Máy</span>
              </button>

              <button
                onClick={() => onOpenOcrModal(document)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold rounded-2xl text-xs transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>AI Trích Xuất Văn Bản (OCR)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                >
                  <Printer className="w-4 h-4 text-blue-400" />
                  <span>In Tài Liệu</span>
                </button>

                <button
                  onClick={handleEmailShare}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                >
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>Gửi Email</span>
                </button>
              </div>
            </div>

            {/* PDF Export Configuration */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cấu Hình PDF</h3>

              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Khổ Giấy</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="a4">Kích thước A4 (210 x 297 mm)</option>
                    <option value="letter">Kích thước Letter (216 x 279 mm)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Hướng Giấy</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="portrait">Dọc (Portrait)</option>
                    <option value="landscape">Ngang (Landscape)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <input
                      type="checkbox"
                      checked={includeWatermark}
                      onChange={(e) => setIncludeWatermark(e.target.checked)}
                      className="accent-blue-600 rounded"
                    />
                    <span className="text-slate-300 font-semibold text-xs">
                      Hiện Chân Trang Chữ Ký "By Nguyễn Trung Tín"
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Author Attribution Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 space-y-1 text-xs">
              <div className="flex items-center space-x-1.5 text-blue-400 font-bold">
                <UserCheck className="w-4 h-4" />
                <span>{APP_AUTHOR_PROFILE.signature}</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Ứng dụng xử lý tệp PDF trực tiếp từ trình duyệt của bạn mà không tải dữ liệu riêng tư lên bất kỳ máy chủ bên thứ 3 nào.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
