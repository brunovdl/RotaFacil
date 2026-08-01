'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import {
  SpinnerIcon,
  ReportsIcon,
  PackageIcon,
  DistanceIcon,
  ClockIcon,
  StarsIcon,
  VehicleIcon,
  OilIcon,
  TireIcon,
  FuelIcon,
  CheckIcon,
} from '@/components/ui/icons';
import { VehicleModal } from '@/components/ui/vehicle-modal';
import type { Vehicle } from '@/lib/types';

export default function ReportsPage() {
  const router = useRouter();
  const [operational, setOperational] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [kmByDay, setKmByDay] = useState<any[]>([]);
  const [completion, setCompletion] = useState<any>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'charts'>('overview');

  // Estados de edição inline do Veículo
  const [odometerInput, setOdometerInput] = useState('');
  const [editingOdometer, setEditingOdometer] = useState(false);
  const [savingOdometer, setSavingOdometer] = useState(false);

  const [kmPerLiterInput, setKmPerLiterInput] = useState('');
  const [fuelPriceInput, setFuelPriceInput] = useState('');
  const [editingFuelConfig, setEditingFuelConfig] = useState(false);
  const [savingFuelConfig, setSavingFuelConfig] = useState(false);

  const [registeringOil, setRegisteringOil] = useState(false);
  const [registeringTire, setRegisteringTire] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    loadReports();
  }, [router]);

  const loadReports = async () => {
    try {
      const [op, perf, km, comp, vData] = await Promise.all([
        api.reports.operational(),
        api.reports.performance(),
        api.reports.kmByDay(7),
        api.reports.routeCompletion(),
        api.vehicles.get().catch(() => null),
      ]);
      setOperational(op);
      setPerformance(perf);
      setKmByDay(km || []);
      setCompletion(comp);
      if (vData) {
        setVehicle(vData);
        setOdometerInput(String(vData.odometer_km || 0));
        setKmPerLiterInput(String(vData.km_per_liter || 10));
        setFuelPriceInput(String(vData.fuel_price_per_liter || 0));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const reloadVehicle = async () => {
    try {
      const vData = await api.vehicles.get();
      setVehicle(vData);
      setOdometerInput(String(vData.odometer_km || 0));
      setKmPerLiterInput(String(vData.km_per_liter || 10));
      setFuelPriceInput(String(vData.fuel_price_per_liter || 0));
    } catch (err: any) {
      console.error('Erro ao atualizar veículo:', err);
    }
  };

  const handleSaveOdometer = async () => {
    setSavingOdometer(true);
    try {
      const newOdo = parseFloat(odometerInput) || 0;
      await api.vehicles.update({ odometer_km: newOdo });
      await reloadVehicle();
      setEditingOdometer(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar odômetro');
    } finally {
      setSavingOdometer(false);
    }
  };

  const handleSaveFuelConfig = async () => {
    setSavingFuelConfig(true);
    try {
      await api.vehicles.update({
        km_per_liter: parseFloat(kmPerLiterInput) || 10,
        fuel_price_per_liter: parseFloat(fuelPriceInput) || 0,
      });
      await reloadVehicle();
      setEditingFuelConfig(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar dados de combustível');
    } finally {
      setSavingFuelConfig(false);
    }
  };

  const handleQuickOilChange = async () => {
    setRegisteringOil(true);
    try {
      await api.vehicles.registerOilChange(vehicle?.odometer_km);
      await reloadVehicle();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar troca de óleo');
    } finally {
      setRegisteringOil(false);
    }
  };

  const handleQuickTireChange = async () => {
    setRegisteringTire(true);
    try {
      await api.vehicles.registerTireChange(vehicle?.odometer_km);
      await reloadVehicle();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar troca de pneu');
    } finally {
      setRegisteringTire(false);
    }
  };

  const handleVehicleModalSave = async (data: Partial<Vehicle>) => {
    await api.vehicles.update(data);
    await reloadVehicle();
  };

  const handleModalOilChange = async (odo?: number) => {
    await api.vehicles.registerOilChange(odo);
    await reloadVehicle();
  };

  const handleModalTireChange = async (odo?: number) => {
    await api.vehicles.registerTireChange(odo);
    await reloadVehicle();
  };

  if (loading) {
    return (
      <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        <Header />
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <SpinnerIcon size={32} className="text-brand-500" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Carregando relatórios...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  // Cálculos Financeiros e de Economia
  const totalKm = Number(performance?.completedKm ?? performance?.totalKm ?? 0);
  const kmPerLiter = Number(vehicle?.km_per_liter || 10);
  const fuelPrice = Number(vehicle?.fuel_price_per_liter || 0);

  const estimatedLiters = kmPerLiter > 0 ? totalKm / kmPerLiter : 0;
  const estimatedFuelCost = estimatedLiters * fuelPrice;

  // Economia estimada em 20%
  const economyKm = totalKm * 0.20;
  const economyLiters = kmPerLiter > 0 ? economyKm / kmPerLiter : 0;
  const economyCost = economyLiters * fuelPrice;

  // Alertas e percentuais de manutenção
  const odo = Number(vehicle?.odometer_km || 0);
  const oilLast = Number(vehicle?.oil_last_change_km || 0);
  const oilInterval = Number(vehicle?.oil_change_interval_km || 5000);
  const oilKmDiff = odo - oilLast;
  const oilPercent = Math.min(100, Math.max(0, (oilKmDiff / oilInterval) * 100));

  const tireLast = Number(vehicle?.tire_last_change_km || 0);
  const tireInterval = Number(vehicle?.tire_change_interval_km || 40000);
  const tireKmDiff = odo - tireLast;
  const tirePercent = Math.min(100, Math.max(0, (tireKmDiff / tireInterval) * 100));

  const vehicleTypeLabels: Record<string, string> = {
    car: '🚗 Carro',
    motorcycle: '🏍️ Moto',
    van: '🚐 Van',
    truck: '🚚 Caminhão',
    minibus: '🚌 Micro-ônibus',
    other: '🚗 Veículo',
  };

  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <Header />

      <main className="px-4 pt-4 pb-28 space-y-4 animate-fade-in">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Relatórios de Desempenho</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Acompanhe métricas de entregas, veículo e economia</p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: activeTab === 'overview' ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'transparent',
              color: activeTab === 'overview' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'overview' ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: activeTab === 'charts' ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'transparent',
              color: activeTab === 'charts' ? '#FFFFFF' : 'var(--text-muted)',
              boxShadow: activeTab === 'charts' ? '0 4px 16px rgba(124,58,237,0.3)' : 'none',
            }}
          >
            Gráficos & Economia
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Indicadores Operacionais */}
            <div className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                Volume de Entregas
              </h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Hoje</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{operational?.daily?.deliveries || 0}</p>
                  <p className="text-[10px] text-brand-400">entregas</p>
                </div>
                <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Semana</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{operational?.weekly?.deliveries || 0}</p>
                  <p className="text-[10px] text-brand-400">entregas</p>
                </div>
                <div className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Mês</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{operational?.monthly?.deliveries || 0}</p>
                  <p className="text-[10px] text-brand-400">entregas</p>
                </div>
              </div>
            </div>

            {/* Média de Desempenho */}
            {performance && (
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-300">
                  Desempenho Geral
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total Percorrido</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{performance.totalKm} km</p>
                  </Card>
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Total de Rotas</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{performance.totalRoutes}</p>
                  </Card>
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Média km / entrega</p>
                    <p className="text-lg font-bold text-emerald-400">{performance.avgKmPerDelivery} km</p>
                  </Card>
                  <Card padding="sm">
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Média entregas / rota</p>
                    <p className="text-lg font-bold text-brand-400">{performance.avgDeliveriesPerRoute}</p>
                  </Card>
                </div>
              </div>
            )}

            {/* Completion Rates */}
            {completion && (
              <Card className="space-y-3">
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status de Rotas Geradas</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Concluídas</span>
                      <span className="font-bold text-emerald-400">{completion.completed}</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2">
                      <div className="bg-emerald-400 h-2 rounded-full" style={{
                        width: completion.total > 0 ? `${(completion.completed / completion.total) * 100}%` : '0%'
                      }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Em andamento</span>
                      <span className="font-bold text-brand-400">{completion.active}</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2">
                      <div className="bg-brand-500 h-2 rounded-full" style={{
                        width: completion.total > 0 ? `${(completion.active / completion.total) * 100}%` : '0%'
                      }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>Canceladas</span>
                      <span className="font-bold text-red-400">{completion.cancelled}</span>
                    </div>
                    <div className="w-full bg-surface-3 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{
                        width: completion.total > 0 ? `${(completion.cancelled / completion.total) * 100}%` : '0%'
                      }} />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-4">

            {/* 🚗 CARD DO VEÍCULO E ODÔMETRO EM TEMPO REAL */}
            <Card className="space-y-4 p-4 border border-brand-500/20 bg-surface-2/70 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                    <VehicleIcon size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-300">
                      {vehicleTypeLabels[vehicle?.vehicle_type || 'car']}
                    </span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Odômetro Atual
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setIsVehicleModalOpen(true)}
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 underline bg-brand-500/10 px-2.5 py-1.5 rounded-xl border border-brand-500/20 transition-all press-effect"
                >
                  ⚙️ Configurar Veículo
                </button>
              </div>

              {/* Edição de Odômetro em tempo real */}
              <div className="p-3.5 rounded-2xl bg-black/20 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground" style={{ color: 'var(--text-muted)' }}>
                    Km total acumulado nas rotas:
                  </p>
                  {!editingOdometer ? (
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-extrabold text-white tracking-tight">
                        {odo.toLocaleString('pt-BR')} <span className="text-sm font-normal text-brand-400">km</span>
                      </span>
                    </div>
                  ) : null}
                </div>

                {editingOdometer ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      value={odometerInput}
                      onChange={(e) => setOdometerInput(e.target.value)}
                      placeholder="Ex: 85000"
                      className="w-full sm:w-36 py-2 px-3 rounded-xl bg-surface-1 border border-brand-500/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveOdometer}
                      disabled={savingOdometer}
                      className="px-3 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1 press-effect disabled:opacity-50"
                    >
                      {savingOdometer ? <SpinnerIcon size={14} /> : <CheckIcon size={16} />} Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingOdometer(false);
                        setOdometerInput(String(vehicle?.odometer_km || 0));
                      }}
                      className="px-3 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingOdometer(true)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 text-xs font-semibold border border-brand-500/40 transition-all flex items-center justify-center gap-1.5 press-effect"
                  >
                    ✏️ Alterar Km Atual
                  </button>
                )}
              </div>

              {/* Parâmetros de Combustível Inline */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FuelIcon size={16} className="text-amber-400" />
                    <span className="text-xs font-semibold text-white">Consumo & Preço de Combustível</span>
                  </div>
                  {!editingFuelConfig ? (
                    <button
                      onClick={() => setEditingFuelConfig(true)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                    >
                      Editar Km/L ou R$/L
                    </button>
                  ) : null}
                </div>

                {editingFuelConfig ? (
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Média Consumo (Km/L)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={kmPerLiterInput}
                          onChange={(e) => setKmPerLiterInput(e.target.value)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-surface-1 border border-white/15 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground block mb-1">Preço Litro (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={fuelPriceInput}
                          onChange={(e) => setFuelPriceInput(e.target.value)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-surface-1 border border-white/15 text-white text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingFuelConfig(false)}
                        className="px-2.5 py-1 rounded-lg text-xs text-white/70 hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveFuelConfig}
                        disabled={savingFuelConfig}
                        className="px-3 py-1 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 flex items-center gap-1"
                      >
                        {savingFuelConfig ? <SpinnerIcon size={12} /> : null} Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-muted-foreground" style={{ color: 'var(--text-muted)' }}>Média:</span>
                      <span className="font-bold text-white">{kmPerLiter} km/L</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
                      <span className="text-muted-foreground" style={{ color: 'var(--text-muted)' }}>Preço/L:</span>
                      <span className="font-bold text-amber-400">
                        {fuelPrice > 0 ? `R$ ${fuelPrice.toFixed(2)}` : 'Não definido'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* 💰 GASTO DE COMBUSTÍVEL E ECONOMIA REAL COM OTIMIZAÇÃO */}
            <div className="grid grid-cols-2 gap-2.5">
              <Card padding="sm" className="space-y-1.5 border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-1 text-amber-400">
                  <FuelIcon size={16} />
                  <span className="text-[11px] font-semibold">Gasto Estimado</span>
                </div>
                <p className="text-xl font-black text-amber-300">
                  R$ {estimatedFuelCost.toFixed(2)}
                </p>
                <p className="text-[10px] text-amber-200/70">
                  ~ {estimatedLiters.toFixed(1)} Litros ({totalKm.toFixed(0)} km total)
                </p>
              </Card>

              <Card padding="sm" className="space-y-1.5 border border-emerald-500/30 bg-emerald-500/10">
                <div className="flex items-center gap-1 text-emerald-400">
                  <StarsIcon size={16} />
                  <span className="text-[11px] font-bold">Economia do App</span>
                </div>
                <p className="text-xl font-black text-emerald-300">
                  R$ {economyCost.toFixed(2)}
                </p>
                <p className="text-[10px] text-emerald-200/80">
                  Economizou ~ {economyKm.toFixed(1)} km (20%)
                </p>
              </Card>
            </div>

            {/* 🛠️ MANUTENÇÃO PREVENTIVA (ÓLEO E PNEUS) */}
            <Card className="space-y-3 p-4 border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center justify-between">
                <span>Manutenção Preventiva</span>
                <span className="text-[10px] font-normal text-muted-foreground">Com base no odômetro atual</span>
              </h3>

              {/* Manutenção de Óleo */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <OilIcon size={18} className="text-amber-400" />
                    <span className="text-xs font-semibold text-white">Troca de Óleo</span>
                    <span className="text-[10px] text-muted-foreground">({vehicle?.oil_type || '5W30'})</span>
                  </div>
                  {vehicle?.alerts && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      vehicle.alerts.oil_overdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      vehicle.alerts.oil_due ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {vehicle.alerts.oil_overdue ? '🚨 Vencida!' :
                       vehicle.alerts.oil_due ? `⚠️ Vence em ${vehicle.alerts.km_until_oil} km` :
                       `✅ Em ${vehicle.alerts.km_until_oil} km`}
                    </span>
                  )}
                </div>

                {/* Barra de Progresso de Óleo */}
                <div className="space-y-1">
                  <div className="w-full bg-surface-3 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        oilPercent >= 100 ? 'bg-red-500' : oilPercent >= 90 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, oilPercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Última: {oilLast} km</span>
                    <span>Meta: {oilLast + oilInterval} km</span>
                  </div>
                </div>

                <button
                  onClick={handleQuickOilChange}
                  disabled={registeringOil}
                  className="w-full py-1.5 rounded-xl text-xs font-semibold press-effect transition-all flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}
                >
                  {registeringOil ? <SpinnerIcon size={12} /> : <OilIcon size={14} />}
                  Registrar Troca de Óleo Agora ({odo} km)
                </button>
              </div>

              {/* Revisão de Pneus */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TireIcon size={18} className="text-cyan-400" />
                    <span className="text-xs font-semibold text-white">Revisão / Troca de Pneus</span>
                  </div>
                  {vehicle?.alerts && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      vehicle.alerts.tire_overdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      vehicle.alerts.tire_due ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {vehicle.alerts.tire_overdue ? '🚨 Vencida!' :
                       vehicle.alerts.tire_due ? `⚠️ Vence em ${vehicle.alerts.km_until_tire} km` :
                       `✅ Em ${vehicle.alerts.km_until_tire} km`}
                    </span>
                  )}
                </div>

                {/* Barra de Progresso de Pneus */}
                <div className="space-y-1">
                  <div className="w-full bg-surface-3 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        tirePercent >= 100 ? 'bg-red-500' : tirePercent >= 90 ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, tirePercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Última: {tireLast} km</span>
                    <span>Meta: {tireLast + tireInterval} km</span>
                  </div>
                </div>

                <button
                  onClick={handleQuickTireChange}
                  disabled={registeringTire}
                  className="w-full py-1.5 rounded-xl text-xs font-semibold press-effect transition-all flex items-center justify-center gap-1.5"
                  style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#67E8F9' }}
                >
                  {registeringTire ? <SpinnerIcon size={12} /> : <TireIcon size={14} />}
                  Registrar Troca de Pneu Agora ({odo} km)
                </button>
              </div>
            </Card>

            {/* Gráfico de barras simples dos últimos 7 dias */}
            <Card className="space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Km Percorridos (Últimos 7 dias)</h3>
              {kmByDay.length > 0 ? (
                <div className="space-y-2">
                  {kmByDay.slice(-7).map((item: any) => {
                    const maxKm = Math.max(...kmByDay.map((k: any) => k.km)) || 1;
                    const pct = (item.km / maxKm) * 100;
                    const date = new Date(item.date + 'T12:00:00');
                    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
                    return (
                      <div key={item.date} className="flex items-center gap-2">
                        <span className="text-xs w-9 uppercase" style={{ color: 'var(--text-muted)' }}>{dayName}</span>
                        <div className="flex-1 bg-surface-3 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-5 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                            style={{
                              width: `${Math.max(pct, 8)}%`,
                              background: 'linear-gradient(90deg, #7C3AED, #4F46E5)',
                            }}
                          >
                            <span className="text-[10px] text-white font-bold">
                              {item.km.toFixed(1)} km
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>
                  Nenhum registro de km recente
                </p>
              )}
            </Card>

            {/* Banner de Economia Otimizada */}
            <div
              className="rounded-2xl p-4 space-y-2 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(16,217,160,0.15) 0%, rgba(5,150,105,0.06) 100%)',
                border: '1px solid rgba(16,217,160,0.3)',
              }}
            >
              <div className="flex items-center gap-2">
                <StarsIcon size={20} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-400">Economia Inteligente com RotaFácil</h3>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                A otimização de rotas reduz até <strong className="text-emerald-300">20% da distância percorrida</strong>, economizando combustível e reduzindo desgaste do motor e pneus.
              </p>
            </div>
          </div>
        )}

        {/* Modal Completo do Veículo (opcional via ⚙️ Configurar Veículo) */}
        <VehicleModal
          isOpen={isVehicleModalOpen}
          onClose={() => setIsVehicleModalOpen(false)}
          vehicle={vehicle}
          onSave={handleVehicleModalSave}
          onRegisterOilChange={handleModalOilChange}
          onRegisterTireChange={handleModalTireChange}
        />
      </main>

      <BottomNav />
    </div>
  );
}

