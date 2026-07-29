import React from 'react';
import { Camera, FolderKanban, Settings, Info, Sparkles, UserCheck } from 'lucide-react';
import { APP_AUTHOR_PROFILE } from '../types';

interface HeaderProps {
  activeTab: 'scan' | 'gallery' | 'settings' | 'about';
  setActiveTab: (tab: 'scan' | 'gallery' | 'settings' | 'about') => void;
  documentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, documentCount }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Author Attribution */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('gallery')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
                  {APP_AUTHOR_PROFILE.appTitle}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v1.0.0
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-300 font-semibold">BY NGUYỄN TRUNG TÍN</span>
                <span className="hidden lg:inline text-slate-500">• {APP_AUTHOR_PROFILE.phone}</span>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('scan')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'scan'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden md:inline">Quét tài liệu</span>
              <span className="md:hidden">Quét</span>
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'gallery'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span className="hidden md:inline">Thư viện</span>
              <span className="md:hidden">Kho</span>
              {documentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold bg-slate-700 text-blue-300">
                  {documentCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Giới thiệu</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Cài đặt & Tác giả</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
