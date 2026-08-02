'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from './button';
import { Input } from './input';
import { api } from '@/lib/api';
import { CheckIcon, StarsIcon, CopyIcon } from './icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userEmail?: string;
}

export function SubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
  userEmail = '',
}: SubscriptionModalProps) {
  const [activeTab, setActiveTab] = useState<'pix' | 'card'>('pix');
  const [email, setEmail] = useState(userEmail);
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Estado Pix
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string | null;
    isMock?: boolean;
  } | null>(null);
  const [generatedCanvasUrl, setGeneratedCanvasUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Estado Cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (userEmail) setEmail(userEmail);
  }, [userEmail]);

  // Gera a imagem do QR Code via biblioteca `qrcode` caso base64 não seja fornecido
  useEffect(() => {
    if (!pixData?.qrCode) return;

    if (pixData.qrCodeBase64) {
      setGeneratedCanvasUrl(`data:image/png;base64,${pixData.qrCodeBase64}`);
    } else {
      QRCode.toDataURL(pixData.qrCode, { width: 250, margin: 2 }, (err, url) => {
        if (!err && url) {
          setGeneratedCanvasUrl(url);
        }
      });
    }
  }, [pixData]);

  // Polling resiliente do status do Pix - NUNCA ativa sem retorno aprovado do backend
  useEffect(() => {
    if (!pixData?.paymentId || success) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.subscriptions.checkPayment(pixData.paymentId);
        if (res.approved) {
          setSuccess(true);
          clearInterval(interval);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 2000);
        }
      } catch (err) {
        // Ignora erro no polling silencioso
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pixData, success, onSuccess, onClose]);

  if (!isOpen) return null;

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.subscriptions.createPix({ email, cpf });
      setPixData({
        paymentId: res.paymentId,
        qrCode: res.qrCode,
        qrCodeBase64: res.qrCodeBase64,
        isMock: res.isMock,
      });
      // Importante: NÃO ativa automaticamente nem fecha o modal! Mantém na tela exibindo QR Code e Copia e Cola.
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar Pix no Mercado Pago');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulatePaymentDev = async () => {
    setLoading(true);
    try {
      await api.subscriptions.activate();
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao simular pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handlePayCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.subscriptions.createCard({
        token: 'tok_mock_' + Date.now(),
        paymentMethodId: 'visa',
        email,
        cpf,
      });

      if (res.status === 'approved') {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setError(`Pagamento ${res.status}: ${res.statusDetail || 'Verifique os dados do cartão e tente novamente.'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar cartão de crédito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
              <StarsIcon size={16} /> RotaFácil Premium
            </div>
            <h2 className="text-xl font-bold text-white">Assinatura Mensal</h2>
            <p className="text-xs text-white/60">
              Uso ilimitado de rotas por apenas <span className="font-bold text-emerald-400">R$ 15,00/mês</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-xl bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Estado de Sucesso */}
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckIcon size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Pagamento Confirmado!</h3>
            <p className="text-xs text-white/70">
              Sua assinatura foi ativada com sucesso. Aproveite todas as funcionalidades do RotaFácil!
            </p>
          </div>
        ) : (
          <>
            {/* Tabs de Seleção */}
            <div className="flex rounded-2xl bg-white/5 p-1 border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => { setActiveTab('pix'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'pix'
                    ? 'bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                ⚡ Pix (Instantâneo)
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('card'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all ${
                  activeTab === 'card'
                    ? 'bg-brand-500 text-slate-950 shadow-lg shadow-brand-500/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                💳 Cartão de Crédito
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            {/* Conteúdo Aba Pix */}
            {activeTab === 'pix' && (
              <div>
                {!pixData ? (
                  <form onSubmit={handleGeneratePix} className="space-y-3">
                    <Input
                      label="E-mail para comprovante"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input
                      label="CPF do Pagador (Opcional)"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                    />
                    <Button type="submit" className="w-full" loading={loading}>
                      Gerar QR Code Pix - R$ 15,00
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      {/* Exibição GARANTIDA do QR Code */}
                      {generatedCanvasUrl ? (
                        <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
                          <img
                            src={generatedCanvasUrl}
                            alt="QR Code Pix Mercado Pago"
                            className="w-48 h-48 mx-auto rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 mx-auto rounded-2xl bg-slate-800 border border-white/10 flex flex-col items-center justify-center p-3 text-brand-400 animate-pulse">
                          <span className="text-sm font-semibold">Carregando QR Code...</span>
                        </div>
                      )}

                      <div className="text-xs text-white/80 font-medium">
                        Escaneie o QR Code acima com o app do seu banco
                      </div>

                      {/* Pix Copia e Cola */}
                      <div className="pt-2">
                        <label className="block text-[11px] text-white/50 text-left mb-1 font-medium">
                          Ou use o Pix Copia e Cola:
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pixData.qrCode}
                            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 truncate focus:outline-none"
                          />
                          <Button
                            type="button"
                            onClick={handleCopyPix}
                            variant={copied ? 'secondary' : 'primary'}
                            className="text-xs px-3"
                          >
                            {copied ? 'Copiado!' : 'Copiar'}
                          </Button>
                        </div>
                      </div>

                      {/* Status de aguardando confirmação */}
                      <div className="flex items-center justify-center gap-2 pt-2 text-xs text-brand-300 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                        Aguardando confirmação do pagamento...
                      </div>

                      {/* Botão opcional para teste em ambiente dev/mock */}
                      {pixData.isMock && (
                        <div className="pt-2 border-t border-white/10">
                          <button
                            type="button"
                            onClick={handleSimulatePaymentDev}
                            className="text-[11px] text-brand-400 hover:underline"
                          >
                            [Dev Mode] Simular Confirmação de Pagamento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo Aba Cartão */}
            {activeTab === 'card' && (
              <form onSubmit={handlePayCard} className="space-y-3">
                <Input
                  label="E-mail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Número do Cartão"
                  placeholder="0000 0000 0000 0000"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <Input
                  label="Nome impresso no cartão"
                  placeholder="NOME COMO NO CARTAO"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Validade (MM/AA)"
                    placeholder="12/28"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                  <Input
                    label="CVC / CVV"
                    placeholder="123"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" loading={loading}>
                  Assinar com Cartão - R$ 15,00/mês
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
