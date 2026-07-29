import React from 'react';
import {
  Camera,
  FileCheck,
  Sparkles,
  ShieldCheck,
  Zap,
  Download,
  Phone,
  Mail,
  UserCheck,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { APP_AUTHOR_PROFILE } from '../types';

interface AboutModalProps {
  onStartScanning: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onStartScanning }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center relative overflow-hidden">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-2xl shadow-blue-500/30">
          <Camera className="w-10 h-10" />
        </div>

        <div className="space-y-2 max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {APP_AUTHOR_PROFILE.appTitle}
          </h1>
          <p className="text-sm text-blue-300 font-semibold flex items-center justify-center space-x-1">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>PHÁT TRIỂN BỞI NGUYỄN TRUNG TÍN (SĐT: {APP_AUTHOR_PROFILE.phone})</span>
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-2">
            Giải pháp quét tài liệu thực tế hoàn chỉnh, xử lý hình ảnh thông minh trực tiếp trên trình duyệt web, tự động nâng chất lượng ảnh, trích xuất văn bản AI OCR và đóng gói tệp PDF sắc nét.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStartScanning}
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Camera className="w-5 h-5" />
            <span>Trải Nghiệm Quét Tài Liệu Thực Ngay</span>
          </button>
        </div>
      </div>

      {/* Core Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Quét & Lọc Ảnh Thông Minh</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Áp dụng bộ lọc Magic Color làm sáng nền giấy, loại bỏ bóng mờ và làm đậm mực chữ chuẩn tờ khai ngân hàng.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">AI OCR Trích Văn Bản</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nhận diện toàn bộ chữ viết trong tài liệu tiếng Việt / tiếng Anh bằng AI Gemini, tự động phân tích và tóm tắt nội dung.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Download className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Xuất PDF Khổ A4 Chuẩn</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tạo tệp PDF đa trang chất lượng cao, tùy chỉnh lề giấy, hướng in và đóng dấu chân trang Nguyễn Trung Tín.
          </p>
        </div>
      </div>

      {/* Author Card Footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md shadow-blue-600/30 shrink-0">
            NTT
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white text-sm flex items-center space-x-2">
              <span>Tác giả: {APP_AUTHOR_PROFILE.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Bản Thật</span>
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <a href={`tel:${APP_AUTHOR_PROFILE.phone.replace(/\s+/g, '')}`} className="flex items-center space-x-1 hover:text-emerald-400 transition-colors">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>SĐT: {APP_AUTHOR_PROFILE.phone}</span>
              </a>
              <span>•</span>
              <a href={`mailto:${APP_AUTHOR_PROFILE.contactEmail}`} className="flex items-center space-x-1 hover:text-blue-400 transition-colors">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email: {APP_AUTHOR_PROFILE.contactEmail}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-1.5 shrink-0 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
          <span>Sản phẩm sản xuất thực tế không demo.</span>
        </div>
      </div>
    </div>
  );
};
