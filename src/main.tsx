import React, { StrictMode, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { APP_AUTHOR_PROFILE } from './types.ts';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Document Scanner:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              NTT
            </div>
            <h1 className="text-xl font-bold text-white">Đã Xảy Ra Lỗi Khởi Động</h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Ứng dụng Quét Tài Liệu của <strong>{APP_AUTHOR_PROFILE.name}</strong> gặp gián đoạn tạm thời trên trình duyệt.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-rose-300 font-mono text-left break-all">
              {this.state.error?.message || 'Unknown render error'}
            </div>
            <div className="pt-2 space-y-2 text-xs">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Tải Lại Trang
              </button>
              <div className="text-slate-400 pt-2 border-t border-slate-800">
                Liên hệ hỗ trợ: <strong>{APP_AUTHOR_PROFILE.phone}</strong> • <strong>{APP_AUTHOR_PROFILE.contactEmail}</strong>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (this.props as Props).children;
  }
}


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>
);


