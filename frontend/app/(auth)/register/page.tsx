'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoIcon, BackIcon, StarsIcon } from '@/components/ui/icons';
import { api } from '@/lib/api';

const perks = [
  '7 dias de teste grátis',
  'Sem cartão de crédito',
  'Cancele quando quiser',
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const result = await api.auth.register(name, email, password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col px-6 relative overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      {/* Orbs */}
      <div
        className="absolute top-[-80px] left-[-60px] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute bottom-[200px] right-[-40px] w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(16,217,160,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Header */}
      <div className="pt-14 pb-2 animate-fade-up">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 press-effect"
          style={{
            color: 'var(--text-secondary)',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <BackIcon size={16} />
          <span className="text-sm font-medium">Voltar</span>
        </Link>
      </div>

      <div className="flex-1 pt-6">
        {/* Logo + título */}
        <div className="flex items-center gap-3 mb-4 animate-fade-up" style={{ animationDelay: '60ms', opacity: 0 }}>
          <LogoIcon size={36} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Criar conta grátis
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Comece a otimizar suas entregas hoje
            </p>
          </div>
        </div>

        {/* Perks badges */}
        <div
          className="flex flex-wrap gap-2 mb-6 animate-fade-up"
          style={{ animationDelay: '100ms', opacity: 0 }}
        >
          {perks.map((perk) => (
            <span
              key={perk}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(16,217,160,0.1)',
                border: '1px solid rgba(16,217,160,0.25)',
                color: '#10D9A0',
              }}
            >
              <StarsIcon size={11} />
              {perk}
            </span>
          ))}
        </div>

        {/* Erro */}
        {error && (
          <div
            className="mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-scale-in"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#FCA5A5',
            }}
          >
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 animate-fade-up"
          style={{ animationDelay: '160ms', opacity: 0 }}
        >
          <Input
            label="Nome completo"
            placeholder="Como você quer ser chamado"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            hint="Mínimo 6 caracteres"
            autoComplete="new-password"
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Ao criar sua conta, você aceita os{' '}
            <Link href="/terms" className="text-brand-400 underline underline-offset-2">
              Termos de Uso
            </Link>
            .
          </p>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Criar conta grátis
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div
        className="pb-10 text-center animate-fade-up"
        style={{ animationDelay: '240ms', opacity: 0 }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
