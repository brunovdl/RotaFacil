'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckIcon, BackIcon, LogoIcon } from '@/components/ui/icons';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending email
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--surface)' }}>
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(16,217,160,0.15)', border: '1px solid rgba(16,217,160,0.3)', color: '#10D9A0' }}
        >
          <CheckIcon size={32} />
        </div>
        <h1 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>E-mail enviado!</h1>
        <p className="text-sm text-center mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
          Enviamos instruções de recuperação para <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
        </p>
        <Link
          href="/login"
          className="px-6 py-3 rounded-xl font-semibold text-xs press-effect"
          style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}
        >
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-6 pt-12" style={{ background: 'var(--surface)' }}>
      <div className="mb-8">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold press-effect" style={{ color: 'var(--text-secondary)' }}>
          <BackIcon size={16} />
          Voltar ao login
        </Link>
      </div>

      <div className="flex-1 max-w-sm mx-auto w-full space-y-4">
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.1) 100%)',
              border: '1px solid rgba(124,58,237,0.35)',
            }}
          >
            <LogoIcon size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Recuperar senha</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Digite seu e-mail registrado e enviaremos instruções para redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Enviar instruções
          </Button>
        </form>
      </div>
    </div>
  );
}
