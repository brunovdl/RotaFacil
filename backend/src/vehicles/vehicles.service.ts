import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly db: DatabaseService) {}

  async findByUserId(userId: string) {
    const { data: vehicle, error } = await this.db.client
      .from('vehicles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      // Ignora warning de schema cache temporario e loga apenas erros de infraestrutura
      console.debug('Nota na consulta de veículos no Supabase:', error.message);
    }

    // Se não existir registro de veículo ainda, retorna dados padrão
    const current = vehicle || {
      id: null,
      user_id: userId,
      vehicle_type: 'car',
      odometer_km: 0,
      fuel_type: 'flex',
      km_per_liter: 10,
      fuel_price_per_liter: 0,
      oil_last_change_km: 0,
      oil_change_interval_km: 5000,
      oil_type: '5W30',
      tire_last_change_km: 0,
      tire_change_interval_km: 40000,
    };

    // Cálculos de Alertas de Manutenção
    const odo = Number(current.odometer_km || 0);
    const oilLast = Number(current.oil_last_change_km || 0);
    const oilInterval = Number(current.oil_change_interval_km || 5000);
    const nextOilKm = oilLast + oilInterval;
    const kmUntilOil = nextOilKm - odo;

    const tireLast = Number(current.tire_last_change_km || 0);
    const tireInterval = Number(current.tire_change_interval_km || 40000);
    const nextTireKm = tireLast + tireInterval;
    const kmUntilTire = nextTireKm - odo;

    const alerts = {
      oil_due: kmUntilOil <= 500,
      oil_overdue: kmUntilOil < 0,
      km_until_oil: Math.round(kmUntilOil),
      next_oil_km: Math.round(nextOilKm),

      tire_due: kmUntilTire <= 500,
      tire_overdue: kmUntilTire < 0,
      km_until_tire: Math.round(kmUntilTire),
      next_tire_km: Math.round(nextTireKm),
    };

    return {
      ...current,
      alerts,
    };
  }

  async update(userId: string, dto: UpdateVehicleDto) {
    const existing = await this.findByUserId(userId);

    const vehicleData = {
      vehicle_type: dto.vehicle_type ?? existing.vehicle_type,
      odometer_km: dto.odometer_km ?? existing.odometer_km,
      fuel_type: dto.fuel_type ?? existing.fuel_type,
      km_per_liter: dto.km_per_liter ?? existing.km_per_liter,
      fuel_price_per_liter: dto.fuel_price_per_liter ?? existing.fuel_price_per_liter,
      oil_last_change_km: dto.oil_last_change_km ?? existing.oil_last_change_km,
      oil_change_interval_km: dto.oil_change_interval_km ?? existing.oil_change_interval_km,
      oil_type: dto.oil_type ?? existing.oil_type,
      tire_last_change_km: dto.tire_last_change_km ?? existing.tire_last_change_km,
      tire_change_interval_km: dto.tire_change_interval_km ?? existing.tire_change_interval_km,
      updated_at: new Date().toISOString(),
    };

    if (existing.id) {
      const { data, error } = await this.db.client
        .from('vehicles')
        .update(vehicleData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return this.findByUserId(userId);
    } else {
      const newId = uuidv4();
      const { data, error } = await this.db.client
        .from('vehicles')
        .insert({
          id: newId,
          user_id: userId,
          ...vehicleData,
        })
        .select()
        .single();

      if (error) throw error;
      return this.findByUserId(userId);
    }
  }

  async registerOilChange(userId: string, currentKm?: number) {
    const vehicle = await this.findByUserId(userId);
    const odo = currentKm ?? vehicle.odometer_km;
    return this.update(userId, {
      odometer_km: odo,
      oil_last_change_km: odo,
    });
  }

  async registerTireChange(userId: string, currentKm?: number) {
    const vehicle = await this.findByUserId(userId);
    const odo = currentKm ?? vehicle.odometer_km;
    return this.update(userId, {
      odometer_km: odo,
      tire_last_change_km: odo,
    });
  }

  async addRouteKmToOdometer(userId: string, routeKm: number) {
    if (!routeKm || routeKm <= 0) return;
    try {
      const vehicle = await this.findByUserId(userId);
      const newOdo = Number(vehicle.odometer_km || 0) + Number(routeKm);
      await this.update(userId, { odometer_km: Math.round(newOdo * 10) / 10 });
    } catch (err: any) {
      console.warn('Erro ao atualizar odômetro do veículo:', err.message);
    }
  }
}
