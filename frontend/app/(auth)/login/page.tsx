'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogoIcon, BackIcon } from '@/components/ui/icons';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await api.auth.login(email, password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col px-6 relative overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      {/* Orb de fundo */}
      <div
        className="absolute top-[-60px] right-[-40px] w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Header com voltar */}
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

      {/* Conteúdo */}
      <div className="flex-1 pt-8">

        {/* Logo + título */}
        <div className="flex items-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: '60ms', opacity: 0 }}>
          <LogoIcon size={36} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Bem-vindo de volta
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Entre na sua conta RotaFácil
            </p>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-scale-in"
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
          style={{ animationDelay: '120ms', opacity: 0 }}
        >
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
            autoComplete="current-password"
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Entrar na conta
          </Button>
        </form>
      </div>

      {/* Footer */}
      <div
        className="pb-10 text-center animate-fade-up"
        style={{ animationDelay: '200ms', opacity: 0 }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Não tem conta?{' '}
          <Link href="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            Cadastre-se grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
