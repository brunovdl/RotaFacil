'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { CheckIcon, StarsIcon, AccountIcon } from '@/components/ui/icons';

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        setName(parsed.name || '');
        setEmail(parsed.email || '');
      } catch {}
    }

    loadSubscription();
  }, [router]);

  const loadSubscription = async () => {
    try {
      const sub = await api.subscriptions.get();
      setSubscription(sub);
    } catch {}
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.profile.update({ name, email });
      setMessage('Dados atualizados com sucesso');
    } catch (err: any) {
      setMessage(err.message || 'Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.profile.updatePassword(newPassword);
      setMessage('Senha atualizada com sucesso');
      setNewPassword('');
    } catch (err: any) {
      setMessage(err.message || 'Erro ao atualizar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja encerrar sua conta? Todos os dados serão perdidos.')) return;
    if (!confirm('Esta ação é irreversível. Confirma?')) return;

    try {
      await api.profile.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    } catch {}
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Cancelar assinatura?')) return;
    try {
      await api.subscriptions.cancel();
      loadSubscription();
    } catch {}
  };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />

      <main className="px-4 pt-4 pb-28 space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Configurações da Conta</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Gerencie seu perfil e assinatura</p>
        </div>

        {message && (
          <div
            className="px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2"
            style={{
              background: message.includes('sucesso') ? 'rgba(16,217,160,0.12)' : 'rgba(239,68,68,0.12)',
              border: message.includes('sucesso') ? '1px solid rgba(16,217,160,0.25)' : '1px solid rgba(239,68,68,0.25)',
              color: message.includes('sucesso') ? '#10D9A0' : '#FCA5A5',
            }}
          >
            {message.includes('sucesso') && <CheckIcon size={16} />}
            {message}
          </div>
        )}

        {/* Profile */}
        <Card className="space-y-3">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Dados Pessoais</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-3">
            <Input
              label="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" size="sm" loading={saving}>
              Salvar alterações
            </Button>
          </form>
        </Card>

        {/* Password */}
        <Card className="space-y-3">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Alterar Senha</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" size="sm" loading={saving}>
              Atualizar senha
            </Button>
          </form>
        </Card>

        {/* Subscription */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Assinatura SaaS</h2>
            <StarsIcon size={18} className="text-yellow-400" />
          </div>
          {subscription ? (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span style={{ color: 'var(--text-muted)' }}>Plano Atual</span>
                <span className="font-semibold capitalize text-brand-300">{subscription.plan}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`font-semibold ${subscription.active ? 'text-emerald-400' : 'text-red-400'}`}>
                  {subscription.active ? 'Ativo (7 dias grátis)' : 'Inativo'}
                </span>
              </div>
              {subscription.daysRemaining > 0 && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span style={{ color: 'var(--text-muted)' }}>Dias restantes no teste</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{subscription.daysRemaining} dias</span>
                </div>
              )}
              {subscription.active && (
                <button
                  onClick={handleCancelSubscription}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-semibold press-effect"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
                >
                  Cancelar Assinatura
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Carregando plano...</p>
          )}
        </Card>

        {/* Navigation Preference */}
        <Card className="space-y-3">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Preferências de Navegação</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>GPS de Navegação Padrão</span>
              <select
                className="text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
              >
                <option value="google_maps" style={{ background: '#16162A' }}>Google Maps</option>
                <option value="waze" style={{ background: '#16162A' }}>Waze</option>
              </select>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-secondary)' }}>Unidade de Distância</span>
              <select
                className="text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
              >
                <option value="km" style={{ background: '#16162A' }}>Quilômetros (km)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <div
          className="rounded-2xl p-4 space-y-2"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <h2 className="font-semibold text-xs text-red-400">Encerrar Conta</h2>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Ao encerrar sua conta, todos os históricos de rotas e dados de entregas serão permanentemente removidos.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="w-full py-2 rounded-xl text-xs font-semibold press-effect text-red-400"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            Encerrar minha conta
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
