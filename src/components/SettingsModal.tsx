import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  HardDrive,
  Trash2,
  FileCheck2,
  Mail,
  Phone,
  ShieldCheck,
  Code2,
  Sparkles,
  Check,
  CheckCircle2
} from 'lucide-react';
import { APP_AUTHOR_PROFILE } from '../types';
import { docStorage } from '../services/storage';

interface SettingsModalProps {
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClearAllData }) => {
  const [storageUsageMb, setStorageUsageMb] = useState<number>(0);
  const [clearedNotice, setClearedNotice] = useState<boolean>(false);

  useEffect(() => {
    docStorage.getStorageUsageMB().then((mb) => setStorageUsageMb(mb));
  }, []);

  const handleClearData = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ tài liệu đã lưu trên trình duyệt không? Hành động này không thể hoàn tác.')) {
      await docStorage.clearAll();
      setClearedNotice(true);
      onClearAllData();
      setStorageUsageMb(0);
      setTimeout(() => setClearedNotice(false), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white">Cài Đặt & Thông Tin Tác Giả</h1>
        <p className="text-xs text-slate-400">
          Ứng dụng quét tài liệu bản thật chính thức. Quản lý dung lượng bộ nhớ và thông tin liên hệ trực tiếp với tác giả.
        </p>
      </div>

      {/* Author Profile Highlight Card (PROMINENT AUTHOR SECTION) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/60 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-blue-500/30 shrink-0">
              NTT
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {APP_AUTHOR_PROFILE.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Phát Triển Chính
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Bản Thật (Production)
                </span>
              </div>
              <p className="text-xs text-blue-300 font-semibold mt-0.5">
                {APP_AUTHOR_PROFILE.title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${APP_AUTHOR_PROFILE.phone.replace(/\s+/g, '')}`}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/30 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>{APP_AUTHOR_PROFILE.phone}</span>
            </a>

            <a
              href={`mailto:${APP_AUTHOR_PROFILE.contactEmail}`}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/30 transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>{APP_AUTHOR_PROFILE.contactEmail}</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-blue-400 font-bold">
              <Code2 className="w-4 h-4" />
              <span>Kiến Trúc & Công Nghệ</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Ứng dụng được xây dựng trên nền tảng <strong>React 19, TypeScript, Tailwind CSS v4, HTML5 Canvas</strong> và thư viện xuất <strong>jsPDF</strong>. Tích hợp AI Gemini 2.5 Flash xử lý OCR văn bản tự động.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Cam Kết Bảo Mật Dữ Liệu Thực</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Tất cả ảnh tài liệu được lưu trữ trực tiếp trên bộ nhớ IndexedDB của thiết bị cá nhân. 100% tài liệu thuộc quyền sở hữu của bạn, không qua máy chủ trung gian.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Phiên bản sản phẩm: <strong className="text-white">{APP_AUTHOR_PROFILE.version}</strong></span>
          <span className="text-blue-400 font-semibold">{APP_AUTHOR_PROFILE.signature}</span>
        </div>
      </div>

      {/* Storage Management Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Quản Lý Bộ Nhớ Trình Duyệt</h2>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Dung lượng bộ nhớ IndexedDB đã dùng</span>
            <span className="text-xl font-extrabold text-blue-400">{storageUsageMb} MB</span>
          </div>

          <button
            onClick={handleClearData}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Sạch Dữ Liệu Bộ Nhớ</span>
          </button>
        </div>

        {clearedNotice && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã xóa toàn bộ dữ liệu tài liệu lưu trữ thành công!</span>
          </div>
        )}
      </div>
    </div>
  );
};
