import React, { useState, useRef, useEffect } from 'react';
import { Camera, SwitchCamera, Zap, Upload, Layers, CheckCircle2, Trash2, Image as ImageIcon, AlertCircle, RefreshCw } from 'lucide-react';

interface CameraScannerProps {
  onPagesCaptured: (imageDataUrls: string[]) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({ onPagesCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(true);
  const [capturedPages, setCapturedPages] = useState<string[]>([]);
  const [flashOn, setFlashOn] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Không thể kết nối với Máy ảnh. Vui lòng cấp quyền truy cập camera trong trình duyệt hoặc tải tệp ảnh từ thiết bị.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const toggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const toggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;

    try {
      const capabilities = track.getCapabilities() as any;
      if (capabilities && capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn }] as any
        });
        setFlashOn(!flashOn);
      } else {
        alert('Thiết bị hoặc trình duyệt không hỗ trợ Đèn Flash.');
      }
    } catch (e) {
      console.warn('Flash error:', e);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

    setCapturedPages((prev) => [...prev, dataUrl]);

    // Flash effect
    setTimeout(() => {
      setIsCapturing(false);
    }, 200);

    // If single page mode, automatically complete
    if (!isBatchMode) {
      setTimeout(() => {
        onPagesCaptured([dataUrl]);
      }, 300);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPages: string[] = [];
    let processed = 0;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPages.push(event.target.result as string);
        }
        processed++;
        if (processed === files.length) {
          setCapturedPages((prev) => [...prev, ...newPages]);
          if (!isBatchMode && newPages.length > 0) {
            onPagesCaptured(newPages);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePage = (index: number) => {
    setCapturedPages((prev) => prev.filter((_, i) => i !== index));
  };

  const finishScanning = () => {
    if (capturedPages.length === 0) return;
    stopCamera();
    onPagesCaptured(capturedPages);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Mode Selection Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Chế độ Quét Tài Liệu</h2>
            <p className="text-xs text-slate-400">Chọn quét nhiều trang liên tiếp hoặc nhập tệp từ máy</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
          <button
            onClick={() => setIsBatchMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isBatchMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Trang Đơn
          </button>
          <button
            onClick={() => setIsBatchMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isBatchMode ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Nhiều Trang (Batch)
          </button>
        </div>
      </div>

      {/* Main Scanner View Area */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[420px] flex flex-col justify-center items-center">
        {/* Hidden Canvas for Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        {isCameraActive ? (
          <div className="relative w-full h-full min-h-[480px] flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full max-h-[600px] object-contain transition-opacity duration-150 ${
                isCapturing ? 'opacity-30' : 'opacity-100'
              }`}
            />

            {/* Document Frame Guide Overlay */}
            <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-blue-400/60 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-full border border-white/20 rounded-xl flex items-center justify-center">
                <p className="text-xs sm:text-sm font-semibold text-blue-200/80 bg-slate-900/80 px-4 py-1.5 rounded-full backdrop-blur-md border border-blue-500/30">
                  Đặt tài liệu vào khung hình
                </p>
              </div>
            </div>

            {/* Camera Control Overlay Top */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60">
              <button
                onClick={toggleFlash}
                className={`p-2.5 rounded-xl transition-all ${
                  flashOn ? 'bg-amber-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
                title="Bật/Tắt Đèn Flash"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={toggleCameraFacing}
                className="p-2.5 rounded-xl text-slate-300 hover:bg-slate-800 transition-all"
                title="Xoay Camera"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          /* Camera Error / File Import Fallback UI */
          <div className="p-8 text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8" />
            </div>
            {cameraError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs flex items-center space-x-2 text-left">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Chụp hoặc Tải Tài Liệu</h3>
              <p className="text-xs text-slate-400">
                Tải tệp ảnh (JPG, PNG) từ máy tính/điện thoại hoặc thử bật lại máy ảnh.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => startCamera()}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-600/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Bật Lại Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition-all"
              >
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Tải Tệp Lên</span>
              </button>
            </div>
          </div>
        )}

        {/* Capture Trigger Bar at Bottom */}
        {isCameraActive && (
          <div className="w-full bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 p-4 flex items-center justify-between px-6">
            {/* File upload trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Nhập tệp</span>
            </button>

            {/* Big Shutter Button */}
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="relative group p-1.5 rounded-full border-2 border-white/80 bg-slate-900 shadow-xl transition-transform active:scale-95"
            >
              <div className="w-14 h-14 rounded-full bg-blue-600 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                <Camera className="w-7 h-7 text-white" />
              </div>
            </button>

            {/* Batch count indicator or finish */}
            <div>
              {capturedPages.length > 0 ? (
                <button
                  onClick={finishScanning}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xong ({capturedPages.length})</span>
                </button>
              ) : (
                <div className="w-20" />
              )}
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple={isBatchMode}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Captured Batch Pages Tray */}
      {capturedPages.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">
                Các Trang Đã Quét ({capturedPages.length})
              </h3>
            </div>
            <button
              onClick={finishScanning}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all"
            >
              <span>Tiếp Tục Chỉnh Sửa & Tạo PDF</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
            {capturedPages.map((pageData, index) => (
              <div key={index} className="relative group shrink-0">
                <img
                  src={pageData}
                  alt={`Trang ${index + 1}`}
                  className="w-20 h-28 object-cover rounded-xl border border-slate-700 shadow-md group-hover:border-blue-500 transition-all"
                />
                <span className="absolute top-1 left-1 bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-slate-700">
                  #{index + 1}
                </span>
                <button
                  onClick={() => removePage(index)}
                  className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  title="Xóa trang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
