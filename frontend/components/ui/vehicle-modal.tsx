'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card } from './card';
import { Button } from './button';
import { Input } from './input';
import { VehicleIcon, OilIcon, TireIcon, FuelIcon } from './icons';
import type { Vehicle } from '@/lib/types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onSave: (data: Partial<Vehicle>) => Promise<void>;
  onRegisterOilChange: (odometerKm?: number) => Promise<void>;
  onRegisterTireChange: (odometerKm?: number) => Promise<void>;
}

export function VehicleModal({
  isOpen,
  onClose,
  vehicle,
  onSave,
  onRegisterOilChange,
  onRegisterTireChange,
}: VehicleModalProps) {
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
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (vehicle) {
      setVehicleType(vehicle.vehicle_type || 'car');
      setOdometerKm(String(vehicle.odometer_km || 0));
      setFuelType(vehicle.fuel_type || 'flex');
      setKmPerLiter(String(vehicle.km_per_liter || 10));
      setFuelPricePerLiter(String(vehicle.fuel_price_per_liter || 0));
      setOilLastChangeKm(String(vehicle.oil_last_change_km || 0));
      setOilChangeIntervalKm(String(vehicle.oil_change_interval_km || 5000));
      setOilType(vehicle.oil_type || '5W30');
      setTireLastChangeKm(String(vehicle.tire_last_change_km || 0));
      setTireChangeIntervalKm(String(vehicle.tire_change_interval_km || 40000));
    }
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await onSave({
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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar veículo');
    } finally {
      setSaving(false);
    }
  };

  const handleOilNow = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const odo = parseFloat(odometerKm) || 0;
      await onRegisterOilChange(odo);
      setOilLastChangeKm(String(odo));
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar troca de óleo');
    } finally {
      setSaving(false);
    }
  };

  const handleTireNow = async () => {
    setSaving(true);
    setErrorMsg('');
    try {
      const odo = parseFloat(odometerKm) || 0;
      await onRegisterTireChange(odo);
      setTireLastChangeKm(String(odo));
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao registrar troca de pneu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-lg rounded-3xl p-5 md:p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-scale-in"
        style={{
          background: 'rgba(22, 22, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <VehicleIcon size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                Dados do Veículo & Manutenção
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Gerencie odômetro, consumo e revisões
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Veículo & Odômetro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="w-full">
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Tipo de Veículo
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full py-3 px-3.5 text-sm transition-all duration-200 input-dark"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="car" style={{ background: '#16162A' }}>🚗 Carro</option>
                <option value="motorcycle" style={{ background: '#16162A' }}>🏍️ Moto</option>
                <option value="van" style={{ background: '#16162A' }}>🚐 Van</option>
                <option value="truck" style={{ background: '#16162A' }}>🚚 Caminhão</option>
                <option value="minibus" style={{ background: '#16162A' }}>🚌 Micro-ônibus</option>
                <option value="other" style={{ background: '#16162A' }}>🚗 Outro</option>
              </select>
            </div>

            <Input
              label="Odômetro Atual (Km)"
              type="number"
              placeholder="Ex: 85000"
              value={odometerKm}
              onChange={(e) => setOdometerKm(e.target.value)}
            />
          </div>

          {/* Combustível, Consumo Km/L e Preço/L */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="w-full">
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Combustível
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full py-3 px-3.5 text-sm transition-all duration-200 input-dark"
                style={{ color: 'var(--text-primary)' }}
              >
                <option value="flex" style={{ background: '#16162A' }}>Flex</option>
                <option value="gasoline" style={{ background: '#16162A' }}>Gasolina</option>
                <option value="alcohol" style={{ background: '#16162A' }}>Álcool</option>
                <option value="diesel" style={{ background: '#16162A' }}>Diesel</option>
                <option value="gas" style={{ background: '#16162A' }}>Gás (GNV)</option>
              </select>
            </div>

            <Input
              label="Consumo (Km/L)"
              type="number"
              step="0.1"
              placeholder="Ex: 12.5"
              value={kmPerLiter}
              onChange={(e) => setKmPerLiter(e.target.value)}
            />

            <Input
              label="Preço/L (R$)"
              type="number"
              step="0.01"
              placeholder="Ex: 5.79"
              value={fuelPricePerLiter}
              onChange={(e) => setFuelPricePerLiter(e.target.value)}
            />
          </div>

          {/* ── Manutenção de Óleo ── */}
          <div className="p-3.5 rounded-2xl space-y-3 bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <OilIcon size={18} className="text-amber-400" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Troca de Óleo
                </span>
              </div>
              {vehicle?.alerts && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  vehicle.alerts.oil_overdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  vehicle.alerts.oil_due ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {vehicle.alerts.oil_overdue ? 'Vencida!' :
                   vehicle.alerts.oil_due ? `Vence em ${vehicle.alerts.km_until_oil} km` :
                   `Próxima em ${vehicle.alerts.km_until_oil} km`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Input
                label="Km Última Troca"
                type="number"
                placeholder="Ex: 80000"
                value={oilLastChangeKm}
                onChange={(e) => setOilLastChangeKm(e.target.value)}
              />
              <Input
                label="Intervalo (Km)"
                type="number"
                placeholder="Ex: 5000"
                value={oilChangeIntervalKm}
                onChange={(e) => setOilChangeIntervalKm(e.target.value)}
              />
              <Input
                label="Tipo de Óleo"
                placeholder="Ex: 5W30"
                value={oilType}
                onChange={(e) => setOilType(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleOilNow}
              className="w-full py-2.5 rounded-xl text-xs font-semibold press-effect transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#FCD34D' }}
            >
              <OilIcon size={14} /> Registrar Troca de Óleo Agora (Km {odometerKm})
            </button>
          </div>

          {/* ── Manutenção de Pneus ── */}
          <div className="p-3.5 rounded-2xl space-y-3 bg-white/[0.03] border border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TireIcon size={18} className="text-cyan-400" />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Revisão de Pneus
                </span>
              </div>
              {vehicle?.alerts && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  vehicle.alerts.tire_overdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  vehicle.alerts.tire_due ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {vehicle.alerts.tire_overdue ? 'Vencida!' :
                   vehicle.alerts.tire_due ? `Vence em ${vehicle.alerts.km_until_tire} km` :
                   `Próxima em ${vehicle.alerts.km_until_tire} km`}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                label="Km Última Troca"
                type="number"
                placeholder="Ex: 50000"
                value={tireLastChangeKm}
                onChange={(e) => setTireLastChangeKm(e.target.value)}
              />
              <Input
                label="Intervalo (Km)"
                type="number"
                placeholder="Ex: 40000"
                value={tireChangeIntervalKm}
                onChange={(e) => setTireChangeIntervalKm(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleTireNow}
              className="w-full py-2.5 rounded-xl text-xs font-semibold press-effect transition-all flex items-center justify-center gap-2"
              style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#67E8F9' }}
            >
              <TireIcon size={14} /> Registrar Troca de Pneu Agora (Km {odometerKm})
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
