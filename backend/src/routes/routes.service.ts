import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { OptimizationService } from '../optimization/optimization.service';
import { CreateRouteDto } from './dto/create-route.dto';

@Injectable()
export class RoutesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly optimization: OptimizationService,
  ) {}

  async create(userId: string, dto: CreateRouteDto): Promise<any> {
    const optimized = this.optimization.optimize(
      { lat: dto.start_lat, lng: dto.start_lng },
      dto.stops.map((s) => ({ ...s })),
    );

    const routeId = uuidv4();

    const totalDistance = optimized.stops.reduce((acc, s) => acc + (s.distanceFromPrevious || 0), 0);
    const estimatedDuration = Math.round(totalDistance * 2);

    const { error: routeError } = await this.db.client.from('routes').insert({
      id: routeId,
      user_id: userId,
      name: dto.name,
      start_lat: dto.start_lat,
      start_lng: dto.start_lng,
      total_distance_km: Math.round(totalDistance * 10) / 10,
      estimated_duration_min: estimatedDuration,
      status: 'active',
    });

    if (routeError) throw routeError;

    const stopsData = optimized.stops.map((stop, index) => ({
      id: uuidv4(),
      route_id: routeId,
      order_index: index + 1,
      cep: stop.cep,
      street: stop.street,
      number: stop.number,
      complement: stop.complement || null,
      neighborhood: stop.neighborhood,
      city: stop.city,
      state: stop.state,
      lat: stop.lat,
      lng: stop.lng,
      completed: false,
    }));

    const { error: stopsError } = await this.db.client
      .from('route_stops')
      .insert(stopsData);

    if (stopsError) throw stopsError;

    return {
      id: routeId,
      name: dto.name,
      totalDistance,
      estimatedDuration,
      stops: optimized.stops,
    };
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.db.client
      .from('routes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return { data, total: count, page, limit };
  }

  async findById(id: string, userId: string) {
    const { data, error } = await this.db.client
      .from('routes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Rota não encontrada');
    }

    const { data: stops } = await this.db.client
      .from('route_stops')
      .select('*')
      .eq('route_id', id)
      .order('order_index', { ascending: true });

    const formattedStops = (stops || []).map((stop) => {
      let status = stop.status || (stop.completed ? 'completed' : 'pending');
      let skipReason = stop.skip_reason || null;

      if (!stop.status && stop.complement && stop.complement.includes('[ADIADA:')) {
        status = 'skipped';
        const match = stop.complement.match(/\[ADIADA:\s*([^\]]+)\]/);
        if (match) skipReason = match[1];
      }

      return {
        ...stop,
        status,
        skip_reason: skipReason,
      };
    });

    return { ...data, stops: formattedStops };
  }

  async updateStatus(id: string, userId: string, status: string) {
    const { data, error } = await this.db.client
      .from('routes')
      .update({ status })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async duplicate(id: string, userId: string) {
    const original = await this.findById(id, userId);
    const newId = uuidv4();

    const { error: routeError } = await this.db.client.from('routes').insert({
      id: newId,
      user_id: userId,
      name: `${original.name} (cópia)`,
      start_lat: original.start_lat,
      start_lng: original.start_lng,
      total_distance_km: original.total_distance_km,
      estimated_duration_min: original.estimated_duration_min,
      status: 'active',
    });

    if (routeError) throw routeError;

    const stopsData = (original.stops || []).map((stop) => ({
      id: uuidv4(),
      route_id: newId,
      order_index: stop.order_index,
      cep: stop.cep,
      street: stop.street,
      number: stop.number,
      complement: stop.complement,
      neighborhood: stop.neighborhood,
      city: stop.city,
      state: stop.state,
      lat: stop.lat,
      lng: stop.lng,
      completed: false,
    }));

    if (stopsData.length > 0) {
      await this.db.client.from('route_stops').insert(stopsData);
    }

    return { id: newId, name: `${original.name} (cópia)` };
  }

  async remove(id: string, userId: string) {
    await this.db.client.from('route_stops').delete().eq('route_id', id);
    await this.db.client.from('routes').delete().eq('id', id).eq('user_id', userId);
    return { message: 'Rota excluída com sucesso' };
  }

  async getTodayStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    const { data: todayRoutes } = await this.db.client
      .from('routes')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', todayStr);

    const totalDeliveries = (todayRoutes || []).reduce((acc, r) => {
      return acc;
    }, 0);

    const { count: totalStops } = await this.db.client
      .from('route_stops')
      .select('*', { count: 'exact', head: true })
      .in('route_id', (todayRoutes || []).map((r) => r.id));

    const currentRoute = (todayRoutes || []).find((r) => r.status === 'active');

    return {
      todayRoutes: todayRoutes?.length || 0,
      totalStops: totalStops || 0,
      currentRoute: currentRoute
        ? {
            id: currentRoute.id,
            name: currentRoute.name,
            totalDistance: currentRoute.total_distance_km,
            estimatedDuration: currentRoute.estimated_duration_min,
          }
        : null,
    };
  }
}
