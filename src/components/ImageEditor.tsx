import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sliders,
  RotateCw,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  FileText,
  Tag,
  FolderKanban,
  ArrowLeft,
  ArrowRight,
  Download,
  Sparkles,
  Check
} from 'lucide-react';
import {
  DocumentPage,
  PageFilter,
  FilterSettings,
  ScannedDocument,
  DocumentCategory,
  APP_AUTHOR_PROFILE
} from '../types';
import { processImageWithFilter } from '../services/imageFilters';
import { docStorage } from '../services/storage';
import { downloadDocumentPdf } from '../services/pdfGenerator';

interface ImageEditorProps {
  initialPages: string[];
  existingDocument?: ScannedDocument | null;
  onSaveSuccess: (doc: ScannedDocument) => void;
  onCancel: () => void;
}

const DEFAULT_SETTINGS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  sharpness: 0,
  rotation: 0
};

export const ImageEditor: React.FC<ImageEditorProps> = ({
  initialPages,
  existingDocument,
  onSaveSuccess,
  onCancel
}) => {
  const [pages, setPages] = useState<DocumentPage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<DocumentCategory>('work');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Initialize pages on load
  useEffect(() => {
    if (existingDocument) {
      setPages(existingDocument.pages);
      setTitle(existingDocument.title);
      setCategory(existingDocument.category);
      setTagsInput(existingDocument.tags ? existingDocument.tags.join(', ') : '');
    } else {
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      setTitle(`Tài Liệu Quét_${dateStr}`);

      const formattedPages: DocumentPage[] = initialPages.map((dataUrl, idx) => ({
        id: `page_${Date.now()}_${idx}`,
        pageNumber: idx + 1,
        originalImageDataUrl: dataUrl,
        processedImageDataUrl: dataUrl,
        filter: 'magic', // default to magic enhance for documents!
        filterSettings: { ...DEFAULT_SETTINGS },
        width: 800,
        height: 1100
      }));

      setPages(formattedPages);

      // Automatically run magic filter on all initial pages
      runFilterOnPages(formattedPages, 'magic');
    }
  }, [initialPages, existingDocument]);

  const runFilterOnPages = async (targetPages: DocumentPage[], filterName: PageFilter) => {
    setIsProcessing(true);
    const updated = await Promise.all(
      targetPages.map(async (page) => {
        const newUrl = await processImageWithFilter(
          page.originalImageDataUrl,
          filterName,
          page.filterSettings
        );
        return {
          ...page,
          filter: filterName,
          processedImageDataUrl: newUrl
        };
      })
    );
    setPages(updated);
    setIsProcessing(false);
  };

  const currentPage = pages[activePageIndex];

  const updateCurrentPageFilter = async (filter: PageFilter) => {
    if (!currentPage) return;
    setIsProcessing(true);

    const newUrl = await processImageWithFilter(
      currentPage.originalImageDataUrl,
      filter,
      currentPage.filterSettings
    );

    setPages((prev) =>
      prev.map((p, idx) =>
        idx === activePageIndex
          ? { ...p, filter, processedImageDataUrl: newUrl }
          : p
      )
    );
    setIsProcessing(false);
  };

  const updateCurrentPageSetting = async (key: keyof FilterSettings, value: number) => {
    if (!currentPage) return;

    const newSettings = {
      ...currentPage.filterSettings,
      [key]: value
    };

    const newUrl = await processImageWithFilter(
      currentPage.originalImageDataUrl,
      currentPage.filter,
      newSettings
    );

    setPages((prev) =>
      prev.map((p, idx) =>
        idx === activePageIndex
          ? { ...p, filterSettings: newSettings, processedImageDataUrl: newUrl }
          : p
      )
    );
  };

  const rotateCurrentPage = async (deg: number) => {
    if (!currentPage) return;
    const currentRot = currentPage.filterSettings.rotation || 0;
    const newRot = (currentRot + deg + 360) % 360;

    await updateCurrentPageSetting('rotation', newRot);
  };

  const movePage = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    const copy = [...pages];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);

    // Re-index pageNumbers
    const reindexed = copy.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(reindexed);
    setActivePageIndex(toIdx);
  };

  const deleteCurrentPage = () => {
    if (pages.length <= 1) {
      alert('Tài liệu phải có ít nhất 1 trang.');
      return;
    }
    const filtered = pages.filter((_, idx) => idx !== activePageIndex);
    const reindexed = filtered.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    setPages(reindexed);
    setActivePageIndex(Math.max(0, activePageIndex - 1));
  };

  const handleSaveDocument = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên tài liệu.');
      return;
    }

    setIsSaving(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const now = new Date().toISOString();
    const docId = existingDocument ? existingDocument.id : `doc_${Date.now()}`;

    // Calculate file size estimate
    const totalChars = pages.reduce(
      (acc, p) => acc + (p.processedImageDataUrl || p.originalImageDataUrl).length,
      0
    );
    const sizeMb = (totalChars / (1024 * 1024) * 0.75).toFixed(2);

    const newDoc: ScannedDocument = {
      id: docId,
      title: title.trim(),
      category: category,
      tags: tags,
      pages: pages,
      createdAt: existingDocument ? existingDocument.createdAt : now,
      updatedAt: now,
      fileSizeEstimate: `${sizeMb} MB`,
      ocrText: existingDocument?.ocrText || '',
      summary: existingDocument?.summary || '',
      authorNote: `Biên tập bởi Nguyễn Trung Tín Engine`
    };

    await docStorage.saveDocument(newDoc);
    setIsSaving(false);

    setShowToast('Đã lưu tài liệu thành công!');
    setTimeout(() => {
      onSaveSuccess(newDoc);
    }, 800);
  };

  const handleQuickDownloadPdf = async () => {
    if (pages.length === 0) return;
    const tempDoc: ScannedDocument = {
      id: 'temp',
      title: title || 'Tai_Lieu_Quet',
      category: category,
      tags: [],
      pages: pages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileSizeEstimate: '1.0 MB'
    };

    await downloadDocumentPdf(tempDoc, {
      includeWatermark: true,
      watermarkText: `Scanned with Document Scanner • By Nguyễn Trung Tín`
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-emerald-400/30">
          <Check className="w-5 h-5" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Editor Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
            title="Quay lại"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Chỉnh Sửa & Xử Lý Tài Liệu</h2>
            <p className="text-xs text-slate-400">
              {pages.length} trang • Phát triển bởi <span className="text-blue-400 font-semibold">{APP_AUTHOR_PROFILE.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleQuickDownloadPdf}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Tải PDF</span>
          </button>

          <button
            onClick={handleSaveDocument}
            disabled={isSaving}
            className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu...' : 'Lưu Vào Thư Viện'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Previewer & Page Selector */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Image Stage */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-6 min-h-[500px] flex items-center justify-center shadow-2xl overflow-hidden">
            {currentPage ? (
              <div className="relative max-w-full max-h-[600px] flex items-center justify-center">
                <img
                  src={currentPage.processedImageDataUrl || currentPage.originalImageDataUrl}
                  alt={`Trang ${activePageIndex + 1}`}
                  className="max-h-[580px] w-auto object-contain rounded-xl shadow-2xl border border-slate-800 transition-all"
                />

                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm rounded-xl flex items-center justify-center text-white space-x-2 font-medium text-sm">
                    <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
                    <span>Đang áp dụng bộ lọc...</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Không có trang nào</p>
            )}

            {/* Quick Action Overlay Buttons on Image Stage */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700">
              <button
                onClick={() => rotateCurrentPage(-90)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                title="Xoay Trái 90°"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => rotateCurrentPage(90)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                title="Xoay Phải 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={deleteCurrentPage}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                title="Xóa Trang Này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Thumbnails Navigation Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center space-x-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700">
            {pages.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => setActivePageIndex(idx)}
                className={`relative shrink-0 cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                  idx === activePageIndex
                    ? 'border-blue-500 ring-4 ring-blue-500/20 scale-105'
                    : 'border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={p.processedImageDataUrl || p.originalImageDataUrl}
                  alt={`Thẻ trang ${idx + 1}`}
                  className="w-16 h-22 object-cover"
                />
                <span className="absolute bottom-1 right-1 bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  {idx + 1}
                </span>
              </div>
            ))}

            {/* Page move controls */}
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
              <button
                onClick={() => movePage(activePageIndex, activePageIndex - 1)}
                disabled={activePageIndex === 0}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
                title="Chuyển sang trái"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => movePage(activePageIndex, activePageIndex + 1)}
                disabled={activePageIndex === pages.length - 1}
                className="p-2 text-slate-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-800"
                title="Chuyển sang phải"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Filters, Adjustments & Metadata Form */}
        <div className="lg:col-span-4 space-y-6">
          {/* Preset Filters Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Bộ Lọc Văn Bản</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateCurrentPageFilter('magic')}
                className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all ${
                  currentPage?.filter === 'magic'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold flex items-center space-x-1">
                  <span>🪄 Magic Color</span>
                </span>
                <span className="text-[10px] text-slate-400">Trắng sáng & sắc nét chữ</span>
              </button>

              <button
                onClick={() => updateCurrentPageFilter('bw')}
                className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all ${
                  currentPage?.filter === 'bw'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold">🖤 B&W Scan</span>
                <span className="text-[10px] text-slate-400">Trắng đen chuẩn ngân hàng</span>
              </button>

              <button
                onClick={() => updateCurrentPageFilter('grayscale')}
                className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all ${
                  currentPage?.filter === 'grayscale'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold">🩶 Grayscale</span>
                <span className="text-[10px] text-slate-400">Tông xám chuẩn</span>
              </button>

              <button
                onClick={() => updateCurrentPageFilter('original')}
                className={`p-3 rounded-xl border text-left flex flex-col space-y-1 transition-all ${
                  currentPage?.filter === 'original'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-bold">🖼️ Ảnh Gốc</span>
                <span className="text-[10px] text-slate-400">Giữ nguyên màu chụp</span>
              </button>
            </div>

            {/* Fine Tuning Sliders */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5 text-blue-400" />
                  <span>Độ Sáng (Brightness)</span>
                </span>
                <span className="text-xs text-blue-400 font-semibold">
                  {currentPage?.filterSettings?.brightness || 0}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={currentPage?.filterSettings?.brightness || 0}
                onChange={(e) => updateCurrentPageSetting('brightness', parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-300 font-medium">Độ Tương Phản (Contrast)</span>
                <span className="text-xs text-blue-400 font-semibold">
                  {currentPage?.filterSettings?.contrast || 0}
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                value={currentPage?.filterSettings?.contrast || 0}
                onChange={(e) => updateCurrentPageSetting('contrast', parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Document Metadata Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">Thông Tin Tài Liệu</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tên Tài Liệu
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Hợp đồng lao động, Hóa đơn..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Danh Mục (Folder)
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="work">💼 Công việc</option>
                  <option value="personal">🏠 Cá nhân</option>
                  <option value="invoices">🧾 Hóa đơn / Tải đơn</option>
                  <option value="contracts">📜 Hợp đồng & Pháp lý</option>
                  <option value="ids">🪪 Giấy tờ / Căn cước</option>
                  <option value="notes">📝 Ghi chú & Sách</option>
                  <option value="academic">🎓 Học tập / Bằng cấp</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Thẻ Đánh Dấu (Tags, phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="VD: nhansu, 2026, quantrong..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
