'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
  CheckIcon,
  StarsIcon,
  AccountIcon,
  VehicleIcon,
  OilIcon,
  TireIcon,
  FuelIcon,
} from '@/components/ui/icons';
import { VehicleModal } from '@/components/ui/vehicle-modal';
import { SubscriptionModal } from '@/components/ui/subscription-modal';
import type { Vehicle } from '@/lib/types';

export default function SettingsPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Estados do Veículo
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [odometerKm, setOdometerKm] = useState('0');
  const [fuelType, setFuelType] = useState('flex');
  const [kmPerLiter, setKmPerLiter] = useState('10');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('0');
  const [oilLastChangeKm, setOilLastChangeKm] = useState('0');
  const [oilChangeIntervalKm, setOilChangeIntervalKm] = useState('5000');
  const [oilType, setOilType] = useState('5W30');
  const [tireLastChangeKm, setTireLastChangeKm] = useState('0');
  const [tireChangeIntervalKm, setTireChangeIntervalKm] = useState('40000');
  const [savingVehicle, setSavingVehicle] = useState(false);

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
    loadVehicle();
  }, [router]);

  const loadSubscription = async () => {
    try {
      const sub = await api.subscriptions.get();
      setSubscription(sub);
    } catch {}
  };

  const loadVehicle = async () => {
    try {
      const v = await api.vehicles.get();
      setVehicle(v);
      if (v) {
        setVehicleType(v.vehicle_type || 'car');
        setOdometerKm(String(v.odometer_km || 0));
        setFuelType(v.fuel_type || 'flex');
        setKmPerLiter(String(v.km_per_liter || 10));
        setFuelPricePerLiter(String(v.fuel_price_per_liter || 0));
        setOilLastChangeKm(String(v.oil_last_change_km || 0));
        setOilChangeIntervalKm(String(v.oil_change_interval_km || 5000));
        setOilType(v.oil_type || '5W30');
        setTireLastChangeKm(String(v.tire_last_change_km || 0));
        setTireChangeIntervalKm(String(v.tire_change_interval_km || 40000));
      }
    } catch {}
  };

  const handleUpdateVehicle = async (e: FormEvent) => {
    e.preventDefault();
    setSavingVehicle(true);
    setMessage('');
    try {
      const updated = await api.vehicles.update({
        vehicle_type: vehicleType as any,
        odometer_km: parseFloat(odometerKm) || 0,
        fuel_type: fuelType as any,
        km_per_liter: parseFloat(kmPerLiter) || 10,
        fuel_price_per_liter: parseFloat(fuelPricePerLiter) || 0,
        oil_last_change_km: parseFloat(oilLastChangeKm) || 0,
        oil_change_interval_km: parseFloat(oilChangeIntervalKm) || 5000,
        oil_type: oilType,
        tire_last_change_km: parseFloat(tireLastChangeKm) || 0,
        tire_change_interval_km: parseFloat(tireChangeIntervalKm) || 40000,
      });
      setVehicle(updated);
      setMessage('Dados do veículo salvos com sucesso!');
    } catch (err: any) {
      setMessage(err.message || 'Erro ao salvar veículo');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleOilChangeNow = async () => {
    setSavingVehicle(true);
    try {
      const odo = parseFloat(odometerKm) || 0;
      const updated = await api.vehicles.registerOilChange(odo);
      setVehicle(updated);
      setOilLastChangeKm(String(odo));
      setMessage('Troca de óleo registrada com sucesso no odômetro atual!');
    } catch (err: any) {
      setMessage(err.message || 'Erro ao registrar troca de óleo');
    } finally {
      setSavingVehicle(false);
    }
  };

  const handleTireChangeNow = async () => {
    setSavingVehicle(true);
    try {
      const odo = parseFloat(odometerKm) || 0;
      const updated = await api.vehicles.registerTireChange(odo);
      setVehicle(updated);
      setTireLastChangeKm(String(odo));
      setMessage('Troca de pneu registrada com sucesso no odômetro atual!');
    } catch (err: any) {
      setMessage(err.message || 'Erro ao registrar troca de pneu');
    } finally {
      setSavingVehicle(false);
    }
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

        {/* ── Meu Veículo & Manutenção ── */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VehicleIcon size={20} className="text-brand-400" />
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Meu Veículo & Manutenção
              </h2>
            </div>
            {vehicle?.alerts && (vehicle.alerts.oil_due || vehicle.alerts.tire_due) && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ⚠️ Revisão Necessária
              </span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-2 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span style={{ color: 'var(--text-muted)' }}>Veículo & Combustível</span>
              <span className="font-semibold text-brand-300 capitalize">
                {vehicle?.vehicle_type === 'motorcycle' ? '🏍️ Moto' :
                 vehicle?.vehicle_type === 'van' ? '🚐 Van' :
                 vehicle?.vehicle_type === 'truck' ? '🚚 Caminhão' :
                 vehicle?.vehicle_type === 'minibus' ? '🚌 Micro-ônibus' : '🚗 Carro'} ({vehicle?.fuel_type || 'Flex'})
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span style={{ color: 'var(--text-muted)' }}>Odômetro Atual</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {vehicle?.odometer_km ? `${Math.round(vehicle.odometer_km * 10) / 10} km` : '0 km'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span style={{ color: 'var(--text-muted)' }}>Consumo Médio</span>
              <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {vehicle?.km_per_liter || 10} km/L {vehicle?.fuel_price_per_liter ? `(R$ ${vehicle.fuel_price_per_liter.toFixed(2)}/L)` : ''}
              </span>
            </div>
          </div>

          <Button
            type="button"
            className="w-full mt-2"
            onClick={() => setIsVehicleModalOpen(true)}
          >
            <VehicleIcon size={18} className="mr-2" />
            Dados do Veículo
          </Button>
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
                <span className="font-semibold capitalize text-brand-300">
                  {subscription.plan === 'monthly' ? 'Mensal (R$ 15,00/mês)' : 'Trial Grátis'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`font-semibold ${subscription.active && !subscription.isExpired ? 'text-emerald-400' : 'text-red-400'}`}>
                  {subscription.active && !subscription.isExpired ? 'Ativo' : 'Inativo / Expirado'}
                </span>
              </div>
              {subscription.daysRemaining > 0 && (
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span style={{ color: 'var(--text-muted)' }}>
                    {subscription.plan === 'trial' ? 'Dias restantes no teste' : 'Dias restantes na assinatura'}
                  </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{subscription.daysRemaining} dias</span>
                </div>
              )}

              <Button
                type="button"
                className="w-full mt-2"
                onClick={() => setIsSubscriptionModalOpen(true)}
              >
                <StarsIcon size={16} className="mr-2 text-yellow-300" />
                {subscription.plan === 'monthly' ? 'Renovar Assinatura (R$ 15,00)' : 'Assinar RotaFácil (R$ 15,00/mês)'}
              </Button>

              {subscription.active && (
                <button
                  onClick={handleCancelSubscription}
                  className="w-full py-2 rounded-xl text-xs font-semibold press-effect"
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

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        vehicle={vehicle}
        onSave={async (data) => {
          const updated = await api.vehicles.update(data);
          setVehicle(updated);
          setMessage('Dados do veículo salvos com sucesso!');
        }}
        onRegisterOilChange={async (odo) => {
          const updated = await api.vehicles.registerOilChange(odo);
          setVehicle(updated);
          setMessage('Troca de óleo registrada com sucesso!');
        }}
        onRegisterTireChange={async (odo) => {
          const updated = await api.vehicles.registerTireChange(odo);
          setVehicle(updated);
          setMessage('Troca de pneu registrada com sucesso!');
        }}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onSuccess={loadSubscription}
        userEmail={email}
      />

      <BottomNav />
    </div>
  );
}
