import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CameraScanner } from './components/CameraScanner';
import { ImageEditor } from './components/ImageEditor';
import { DocumentGallery } from './components/DocumentGallery';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { AiOcrModal } from './components/AiOcrModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { ScannedDocument, APP_AUTHOR_PROFILE } from './types';
import { docStorage } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'gallery' | 'settings' | 'about' | 'edit'>('gallery');
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [editingDoc, setEditingDoc] = useState<ScannedDocument | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ScannedDocument | null>(null);
  const [ocrDoc, setOcrDoc] = useState<ScannedDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load documents from IndexedDB on mount
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await docStorage.getAllDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to load documents:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handlePagesCaptured = (pages: string[]) => {
    setCapturedPages(pages);
    setEditingDoc(null);
    setActiveTab('edit');
  };

  const handleEditExistingDoc = (doc: ScannedDocument) => {
    setSelectedDoc(null);
    setEditingDoc(doc);
    setCapturedPages([]);
    setActiveTab('edit');
  };

  const handleSaveDocSuccess = (savedDoc: ScannedDocument) => {
    loadDocuments();
    setEditingDoc(null);
    setCapturedPages([]);
    setSelectedDoc(savedDoc);
    setActiveTab('gallery');
  };

  const handleDeleteDoc = async (docId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) {
      await docStorage.deleteDocument(docId);
      loadDocuments();
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
      }
    }
  };

  const handleSaveOcrText = async (docId: string, text: string) => {
    const target = await docStorage.getDocumentById(docId);
    if (target) {
      target.ocrText = text;
      await docStorage.saveDocument(target);
      loadDocuments();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar Header */}
      <Header
        activeTab={activeTab === 'edit' ? 'scan' : activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setEditingDoc(null);
        }}
        documentCount={documents.length}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-400">Đang tải tài liệu...</p>
          </div>
        ) : activeTab === 'scan' ? (
          <CameraScanner onPagesCaptured={handlePagesCaptured} />
        ) : activeTab === 'edit' ? (
          <ImageEditor
            initialPages={capturedPages}
            existingDocument={editingDoc}
            onSaveSuccess={handleSaveDocSuccess}
            onCancel={() => setActiveTab('gallery')}
          />
        ) : activeTab === 'gallery' ? (
          <DocumentGallery
            documents={documents}
            onSelectDocument={(doc) => setSelectedDoc(doc)}
            onDeleteDocument={handleDeleteDoc}
            onNewScan={() => setActiveTab('scan')}
            onOpenOcrModal={(doc) => setOcrDoc(doc)}
          />
        ) : activeTab === 'settings' ? (
          <SettingsModal onClearAllData={() => loadDocuments()} />
        ) : activeTab === 'about' ? (
          <AboutModal onStartScanning={() => setActiveTab('scan')} />
        ) : null}
      </main>

      {/* Footer Branding Bar */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-bold text-white">{APP_AUTHOR_PROFILE.appTitle}</span>
            <span>•</span>
            <span className="text-blue-400 font-semibold">Tác giả: {APP_AUTHOR_PROFILE.name}</span>
            <span>•</span>
            <a href={`tel:${APP_AUTHOR_PROFILE.phone.replace(/\s+/g, '')}`} className="text-emerald-400 hover:underline">
              SĐT: {APP_AUTHOR_PROFILE.phone}
            </a>
            <span>•</span>
            <a href={`mailto:${APP_AUTHOR_PROFILE.contactEmail}`} className="text-slate-300 hover:underline">
              {APP_AUTHOR_PROFILE.contactEmail}
            </a>
          </div>
          <p className="text-slate-500 text-[11px]">
            © {new Date().getFullYear()} Nguyễn Trung Tín. Bản chính thức - Dữ liệu bảo mật cục bộ.
          </p>
        </div>
      </footer>

      {/* Document Detail Preview Modal */}
      {selectedDoc && (
        <DocumentDetailModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onEditDocument={handleEditExistingDoc}
          onOpenOcrModal={(doc) => setOcrDoc(doc)}
        />
      )}

      {/* AI OCR Modal */}
      {ocrDoc && (
        <AiOcrModal
          document={ocrDoc}
          onClose={() => setOcrDoc(null)}
          onSaveOcrText={handleSaveOcrText}
        />
      )}
    </div>
  );
}

// Generator for a rich initial sample document if the storage is brand new
function createSampleDocument(): ScannedDocument {
  // Create a clean canvas drawn document sample
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // White paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 800);

    // Border line
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 6;
    ctx.strokeRect(20, 20, 560, 760);

    // Header
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('HÓA ĐƠN DỊCH VỤ CÔNG NGHỆ', 50, 80);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('Đơn vị cung cấp: NTT Technology Solutions', 50, 110);
    ctx.fillText('Mã chứng từ: NTT-2026-8881', 50, 130);
    ctx.fillText('Ngày quét: ' + new Date().toLocaleDateString('vi-VN'), 50, 150);

    // Divider line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 170);
    ctx.lineTo(550, 170);
    ctx.stroke();

    // Table Content
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Nội dung dịch vụ', 50, 210);
    ctx.fillText('Thành tiền (VND)', 400, 210);

    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('1. Quét & chuẩn hóa tài liệu PDF', 50, 250);
    ctx.fillText('500.000 đ', 400, 250);

    ctx.fillText('2. Nhận diện chữ tự động AI OCR', 50, 290);
    ctx.fillText('300.000 đ', 400, 290);

    ctx.fillText('3. Lưu trữ an toàn bộ nhớ thiết bị', 50, 330);
    ctx.fillText('200.000 đ', 400, 330);

    // Total line
    ctx.beginPath();
    ctx.moveTo(50, 370);
    ctx.lineTo(550, 370);
    ctx.stroke();

    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('TỔNG CỘNG:', 50, 410);
    ctx.fillText('1.000.000 đ', 400, 410);

    // Stamp / Signature
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(350, 500, 180, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ĐÃ XÁC NHẬN', 380, 535);
    ctx.font = '12px sans-serif';
    ctx.fillText('By Nguyễn Trung Tín', 370, 565);
  }

  const sampleImageDataUrl = canvas.toDataURL('image/jpeg', 0.92);

  return {
    id: 'doc_sample_ntt',
    title: 'Hóa_Đơn_Dịch_Vụ_NTT',
    category: 'invoices',
    tags: ['hoadon', 'sample', 'nguyentrungtin'],
    pages: [
      {
        id: 'page_sample_1',
        pageNumber: 1,
        originalImageDataUrl: sampleImageDataUrl,
        processedImageDataUrl: sampleImageDataUrl,
        filter: 'magic',
        filterSettings: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          sharpness: 0,
          rotation: 0
        },
        width: 600,
        height: 800
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileSizeEstimate: '0.4 MB',
    ocrText: 'HÓA ĐƠN DỊCH VỤ CÔNG NGHỆ\nĐơn vị cung cấp: NTT Technology Solutions\nMã chứng từ: NTT-2026-8881\n\nNội dung dịch vụ:\n1. Quét & chuẩn hóa tài liệu PDF - 500.000 đ\n2. Nhận diện chữ tự động AI OCR - 300.000 đ\n3. Lưu trữ an toàn bộ nhớ thiết bị - 200.000 đ\n\nTỔNG CỘNG: 1.000.000 đ\nXác nhận: By Nguyễn Trung Tín',
    summary: 'Hóa đơn dịch vụ quét tài liệu và xử lý AI OCR trị giá 1.000.000 VNĐ.',
    authorNote: 'Mẫu bởi Nguyễn Trung Tín'
  };
}
