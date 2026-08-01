'use client';

import { useState, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { api } from '@/lib/api';
import { CheckIcon, StarsIcon } from './icons';

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

  // Pix state
  const [pixData, setPixData] = useState<{
    paymentId: string;
    qrCode: string;
    qrCodeBase64: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  useEffect(() => {
    if (userEmail) setEmail(userEmail);
  }, [userEmail]);

  // Polling para status do Pix
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
        // Silencioso no polling
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
      });

      // Se for mock em ambiente local dev sem chave real
      if (res.isMock) {
        setTimeout(async () => {
          await api.subscriptions.activate();
          setSuccess(true);
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
          }, 2000);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar Pix');
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

  const handlePayCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulação / Tokenização de cartão
      const token = `card_token_${Date.now()}`;
      const res = await api.subscriptions.createCard({
        token,
        paymentMethodId: 'master',
        email,
        cpf,
      });

      if (res.status === 'approved' || res.isMock) {
        setSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
      } else {
        setError('O pagamento foi recusado. Verifique os dados do cartão.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar cartão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md p-6 space-y-5 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
        style={{ background: '#131326' }}
      >
        {/* Glow de Fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header do Modal */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
              <StarsIcon size={16} /> RotaFácil Premium
            </div>
            <h2 className="text-xl font-bold text-white">Assinatura Mensal</h2>
            <p className="text-xs text-white/60">
              Desbloqueie uso ilimitado por apenas <span className="font-bold text-emerald-400">R$ 15,00/mês</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white rounded-xl bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Sucesso */}
        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckIcon size={36} />
            </div>
            <h3 className="text-lg font-bold text-white">Pagamento Confirmado!</h3>
            <p className="text-xs text-white/70">
              Sua assinatura foi ativada com sucesso. Aproveite o RotaFácil!
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
                      {pixData.qrCodeBase64 ? (
                        <img
                          src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                          alt="QR Code Pix"
                          className="w-48 h-48 mx-auto rounded-xl border border-white/20 p-2 bg-white"
                        />
                      ) : (
                        <div className="w-44 h-44 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center p-3 text-emerald-400">
                          <span className="text-3xl font-bold mb-1">R$ 15,00</span>
                          <span className="text-[11px] text-white/70">Código Pix Gerado</span>
                        </div>
                      )}

                      <p className="text-xs text-white/70">
                        Escaneie com seu banco ou use o botão Copia e Cola abaixo
                      </p>

                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full text-xs py-2.5"
                        onClick={handleCopyPix}
                      >
                        {copied ? '✓ Código Pix Copiado!' : '📋 Copiar Código Pix'}
                      </Button>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      Aguardando confirmação do pagamento...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Conteúdo Aba Cartão */}
            {activeTab === 'card' && (
              <form onSubmit={handlePayCard} className="space-y-3">
                <Input
                  label="Número do Cartão"
                  placeholder="0000 0000 0000 0000"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
                <Input
                  label="Nome Impresso no Cartão"
                  placeholder="COMO NO CARTÃO"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Validade"
                    placeholder="MM/AA"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                  <Input
                    label="CVC"
                    placeholder="123"
                    required
                    maxLength={4}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                  />
                </div>
                <Input
                  label="CPF do Titular"
                  placeholder="000.000.000-00"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                />
                <Button type="submit" className="w-full" loading={loading}>
                  Pagar R$ 15,00 com Cartão
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
