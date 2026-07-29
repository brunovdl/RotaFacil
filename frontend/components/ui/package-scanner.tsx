'use client';

import { useState, useRef } from 'react';
import { CameraIcon } from '@/components/ui/icons';

interface PackageScannerProps {
  onScan: (data: { cep: string; number: string }) => void;
  onClose: () => void;
}

export function PackageScanner({ onScan, onClose }: PackageScannerProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async () => {
    setError('');
    setShowCamera(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Câmera não disponível neste navegador.');
      setShowCamera(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setShowCamera(false);
      if (err.name === 'NotAllowedError') {
        setError('Acesso à câmera negado. Permita o acesso nas configurações do navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('Nenhuma câmera encontrada neste dispositivo.');
      } else {
        setError('Não foi possível acessar a câmera: ' + (err.message || 'erro desconhecido'));
      }
    }
  };

  const captureAndOcr = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    setProcessing(true);

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.8),
      );
      if (!blob) { setProcessing(false); return; }

      const Tesseract = await import('tesseract.js');
      const worker = await Tesseract.createWorker('por');
      const { data } = await worker.recognize(blob);
      await worker.terminate();

      const { cep, number } = parseOcrResult(data.text);
      stopCamera();

      if (cep || number) {
        onScan({ cep, number });
      } else {
        setError('Nenhum CEP ou número encontrado. Tente com melhor iluminação.');
        setProcessing(false);
        setShowCamera(false);
      }
    } catch {
      setError('Erro ao processar imagem. Tente novamente.');
      setProcessing(false);
      setShowCamera(false);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!showCamera) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <div
          className="rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4"
          style={{
            background: 'rgba(22, 22, 42, 0.96)',
            border: '1px solid rgba(124, 58, 237, 0.3)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}
          >
            <CameraIcon size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              Escanear Pacote
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Posicione a etiqueta do pacote com o endereço visível para leitura automática.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={openCamera}
              className="w-full py-3 rounded-xl text-xs font-semibold press-effect flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                color: '#FFFFFF',
              }}
            >
              <CameraIcon size={18} />
              Abrir câmera
            </button>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl text-xs font-semibold press-effect"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera view
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black z-10">
        <button onClick={handleClose} className="text-white/80 text-sm">
          Cancelar
        </button>
        <span className="text-white text-sm">
          {processing ? 'Processando...' : 'Escaneie o endereço'}
        </span>
        <div className="w-14" />
      </div>

      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Scan frame corners */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4/5 aspect-[3/2] max-w-sm relative">
            <div className="absolute -top-0.5 -left-0.5 w-8 h-8 border-t-[3px] border-l-[3px] border-white/70 rounded-tl" />
            <div className="absolute -top-0.5 -right-0.5 w-8 h-8 border-t-[3px] border-r-[3px] border-white/70 rounded-tr" />
            <div className="absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-[3px] border-l-[3px] border-white/70 rounded-bl" />
            <div className="absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-[3px] border-r-[3px] border-white/70 rounded-br" />
          </div>
        </div>

        {processing && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-base font-medium">Lendo endereço...</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center py-6 bg-black z-10">
        <button
          onClick={captureAndOcr}
          disabled={processing}
          className="w-16 h-16 bg-white rounded-full flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all"
        >
          <div className="w-[54px] h-[54px] rounded-full border-[3px] border-gray-400" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function parseOcrResult(text: string): { cep: string; number: string } {
  let cep = '';
  let number = '';

  const cepMatch = text.match(/\b(\d{5}[-\s]?\d{3})\b/);
  if (cepMatch) {
    cep = cepMatch[1].replace(/\D/g, '');
  }

  const lines = text.split('\n');
  for (const line of lines) {
    const numMatch = line.match(/(?:N[º°]?|n[º°]?|numero|número)\s*[.:]?\s*(\d+)/i);
    if (numMatch) { number = numMatch[1]; break; }
  }

  if (!number) {
    for (const line of lines) {
      const n = line.match(/\b(\d{1,5})\b/);
      if (n && !/CEP|N[º°]|n[º°]|SAC|CNPJ|CPF|Fone|Tel|cel|\(\d{2}\)/i.test(line)) {
        number = n[1]; break;
      }
    }
  }

  return { cep, number };
}
