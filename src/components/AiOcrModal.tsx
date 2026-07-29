import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Copy,
  Download,
  X,
  Languages,
  FileText,
  Check,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { ScannedDocument, APP_AUTHOR_PROFILE } from '../types';

interface AiOcrModalProps {
  document: ScannedDocument;
  onClose: () => void;
  onSaveOcrText: (docId: string, text: string) => void;
}

export const AiOcrModal: React.FC<AiOcrModalProps> = ({
  document,
  onClose,
  onSaveOcrText
}) => {
  const [extractedText, setExtractedText] = useState<string>(document.ocrText || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ocr' | 'analyze' | 'translate'>('ocr');
  const [targetLanguage, setTargetLanguage] = useState<string>('Vietnamese');

  const runAiTask = async (promptType: 'ocr' | 'analyze' | 'translate') => {
    if (!document.pages || document.pages.length === 0) {
      setErrorMessage('Tài liệu không chứa hình ảnh để nhận diện.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Pick the first page or active image
      const firstPage = document.pages[0];
      const base64Image = firstPage.processedImageDataUrl || firstPage.originalImageDataUrl;

      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageBase64: base64Image,
          promptType: promptType,
          targetLanguage: targetLanguage
        })
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Tính năng AI OCR yêu cầu backend Node.js server. Khi chạy trên GitHub Pages tĩnh (Static Host), hãy sử dụng trên server Node.js hoặc Cloud Run.');
        }
        throw new Error(`Máy chủ phản hồi lỗi: ${res.statusText || res.status}`);
      }

      const data = await res.json();

      if (data.success && data.text) {
        setExtractedText(data.text);
        if (promptType === 'ocr') {
          onSaveOcrText(document.id, data.text);
        }
      } else {
        setErrorMessage(data.error || 'Không thể trích xuất văn bản từ hình ảnh này.');
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setErrorMessage(err.message || 'Lỗi kết nối tới máy chủ AI.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!document.ocrText) {
      runAiTask('ocr');
    }
  }, [document]);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = window.document.createElement('a');
    const file = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title}_OCR_NguyenTrungTin.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">AI Nhận Diện Văn Bản (OCR)</h2>
              <p className="text-xs text-slate-400">
                Tài liệu: <span className="text-slate-200 font-semibold">{document.title}</span> • By Nguyễn Trung Tín
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center space-x-2 px-5 py-3 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('ocr');
              runAiTask('ocr');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'ocr'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Trích Văn Bản</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('analyze');
              runAiTask('analyze');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'analyze'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phân Tích & Tóm Tắt</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('translate');
              runAiTask('translate');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              activeTab === 'translate'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Dịch Thuật</span>
          </button>
        </div>

        {/* OCR Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 min-h-[280px] bg-slate-950">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                Đang quét và nhận diện chữ bằng AI...
              </p>
              <p className="text-xs text-slate-400">
                Xử lý tự động bằng mô hình AI tiên tiến - Được xây dựng bởi Nguyễn Trung Tín
              </p>
            </div>
          ) : errorMessage ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs text-center space-y-2">
              <p>{errorMessage}</p>
              <button
                onClick={() => runAiTask(activeTab)}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
              >
                Thử Lại
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Kết quả nhận diện văn bản:</span>
                <span className="text-emerald-400 font-semibold">{extractedText.length} ký tự</span>
              </div>

              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                rows={12}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Phát triển bởi <strong className="text-blue-300">{APP_AUTHOR_PROFILE.name}</strong></span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              disabled={!extractedText || isLoading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition-all disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-400" />}
              <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép'}</span>
            </button>

            <button
              onClick={handleDownloadTxt}
              disabled={!extractedText || isLoading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Tải .TXT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
