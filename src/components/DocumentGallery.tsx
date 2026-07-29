import React, { useState } from 'react';
import {
  Search,
  Grid,
  List,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Trash2,
  Eye,
  Plus,
  Tag,
  Star,
  FolderKanban,
  UserCheck
} from 'lucide-react';
import { ScannedDocument, DocumentCategory, APP_AUTHOR_PROFILE } from '../types';
import { downloadDocumentPdf } from '../services/pdfGenerator';

interface DocumentGalleryProps {
  documents: ScannedDocument[];
  onSelectDocument: (doc: ScannedDocument) => void;
  onDeleteDocument: (docId: string) => void;
  onNewScan: () => void;
  onOpenOcrModal: (doc: ScannedDocument) => void;
}

export const DocumentGallery: React.FC<DocumentGalleryProps> = ({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onNewScan,
  onOpenOcrModal
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');

  const categories: { key: DocumentCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'Tất cả', icon: '📂' },
    { key: 'work', label: 'Công việc', icon: '💼' },
    { key: 'personal', label: 'Cá nhân', icon: '🏠' },
    { key: 'invoices', label: 'Hóa đơn', icon: '🧾' },
    { key: 'contracts', label: 'Hợp đồng', icon: '📜' },
    { key: 'ids', label: 'Giấy tờ', icon: '🪪' },
    { key: 'notes', label: 'Ghi chú', icon: '📝' },
    { key: 'academic', label: 'Học tập', icon: '🎓' }
  ];

  // Filter & Search Logic
  const filteredDocs = documents
    .filter((doc) => {
      const matchCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchCategory;

      const matchTitle = doc.title.toLowerCase().includes(term);
      const matchTag = doc.tags && doc.tags.some((t) => t.toLowerCase().includes(term));
      const matchOcr = doc.ocrText && doc.ocrText.toLowerCase().includes(term);

      return matchCategory && (matchTitle || matchTag || matchOcr);
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const getCategoryLabel = (catKey: DocumentCategory) => {
    const found = categories.find((c) => c.key === catKey);
    return found ? `${found.icon} ${found.label}` : '📂 Khác';
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Top Banner & Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Kho Tài Liệu Đã Quét
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {documents.length} tệp
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <span>Lưu trữ an toàn tuyệt đối trên trình duyệt • Tác giả:</span>
              <span className="text-blue-300 font-semibold">{APP_AUTHOR_PROFILE.name}</span>
            </p>
          </div>

          <button
            onClick={onNewScan}
            className="flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Quét Tài Liệu Mới</span>
          </button>
        </div>

        {/* Search & Layout Control Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-800">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên tài liệu, thẻ tag, hoặc từ khóa văn bản..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="title">Tên A-Z</option>
            </select>

            <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Lưới"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Danh sách"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span>{cat.icon}</span> <span className="ml-1">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Content Area */}
      {filteredDocs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">Chưa Có Tài Liệu Nào</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Không tìm thấy tài liệu nào phù hợp với từ khóa hoặc danh mục đã chọn.'
                : 'Bắt đầu quét tài liệu từ máy ảnh hoặc nhập tệp ảnh từ thiết bị của bạn ngay.'}
            </p>
          </div>
          <button
            onClick={onNewScan}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Quét Ngay</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocs.map((doc) => {
            const firstPage = doc.pages[0];
            const dateFormatted = new Date(doc.updatedAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            return (
              <div
                key={doc.id}
                className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-200 flex flex-col justify-between"
              >
                {/* Thumbnail Preview Stage */}
                <div
                  onClick={() => onSelectDocument(doc)}
                  className="relative aspect-[3/4] bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center p-3"
                >
                  {firstPage ? (
                    <img
                      src={firstPage.processedImageDataUrl || firstPage.originalImageDataUrl}
                      alt={doc.title}
                      className="max-h-full max-w-full object-contain rounded-lg border border-slate-800 shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-slate-600" />
                  )}

                  {/* Badges on thumbnail */}
                  <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-700">
                    {getCategoryLabel(doc.category)}
                  </span>

                  <span className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                    {doc.pages.length} trang
                  </span>
                </div>

                {/* Card Meta Footer */}
                <div className="p-4 space-y-3 bg-slate-900 border-t border-slate-800">
                  <div onClick={() => onSelectDocument(doc)} className="cursor-pointer space-y-1">
                    <h3 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{dateFormatted}</span>
                      </span>
                      <span>{doc.fileSizeEstimate || 'PDF'}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex items-center space-x-1 flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-md font-medium border border-slate-700"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => onOpenOcrModal(doc)}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                      title="AI Trích Xuất Văn Bản (OCR)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>OCR</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => downloadDocumentPdf(doc)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                        title="Tải về PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Xóa tài liệu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl divide-y divide-slate-800">
          {filteredDocs.map((doc) => {
            const firstPage = doc.pages[0];
            const dateFormatted = new Date(doc.updatedAt).toLocaleDateString('vi-VN');

            return (
              <div
                key={doc.id}
                className="p-4 flex items-center justify-between hover:bg-slate-850/50 transition-colors gap-4"
              >
                <div
                  onClick={() => onSelectDocument(doc)}
                  className="flex items-center space-x-4 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-12 h-16 bg-slate-950 rounded-lg overflow-hidden shrink-0 border border-slate-800 flex items-center justify-center">
                    {firstPage ? (
                      <img
                        src={firstPage.processedImageDataUrl || firstPage.originalImageDataUrl}
                        alt={doc.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-6 h-6 text-slate-600" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-sm truncate hover:text-blue-400 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                      <span>{getCategoryLabel(doc.category)}</span>
                      <span>•</span>
                      <span>{doc.pages.length} trang</span>
                      <span>•</span>
                      <span>{dateFormatted}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onOpenOcrModal(doc)}
                    className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">AI OCR</span>
                  </button>

                  <button
                    onClick={() => downloadDocumentPdf(doc)}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
