import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async getOperational(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: allRoutes } = await this.db.client
      .from('routes')
      .select('*')
      .eq('user_id', userId);

    const routes = allRoutes || [];

    const routesToday = routes.filter((r) => new Date(r.created_at) >= startOfDay);
    const routesThisWeek = routes.filter((r) => new Date(r.created_at) >= startOfWeek);
    const routesThisMonth = routes.filter((r) => new Date(r.created_at) >= startOfMonth);
    const completedRoutes = routes.filter((r) => r.status === 'completed');

    const routeIds = routes.map((r) => r.id);
    const { data: allStops } = await this.db.client
      .from('route_stops')
      .select('*')
      .in('route_id', routeIds);

    const stops = allStops || [];
    const completedStops = stops.filter((s) => s.completed);

    const totalKm = routes.reduce((acc, r) => acc + (r.total_distance_km || 0), 0);
    const avgKmPerDelivery = stops.length > 0 ? totalKm / stops.length : 0;
    const avgDeliveriesPerRoute = routes.length > 0 ? stops.length / routes.length : 0;

    return {
      daily: {
        deliveries: stops.filter((s) => routeIds.filter((rid) => routesToday.find((r) => r.id === rid)).includes(s.route_id)).length,
        routes: routesToday.length,
      },
      weekly: {
        deliveries: stops.filter((s) => routeIds.filter((rid) => routesThisWeek.find((r) => r.id === rid)).includes(s.route_id)).length,
        routes: routesThisWeek.length,
      },
      monthly: {
        deliveries: stops.filter((s) => routeIds.filter((rid) => routesThisMonth.find((r) => r.id === rid)).includes(s.route_id)).length,
        routes: routesThisMonth.length,
      },
    };
  }

  async getPerformance(userId: string) {
    const { data: routes } = await this.db.client
      .from('routes')
      .select('*')
      .eq('user_id', userId);

    const allRoutes = routes || [];
    const completedRoutes = allRoutes.filter((r) => r.status === 'completed');
    const routeIds = allRoutes.map((r) => r.id);

    const { data: allStops } = await this.db.client
      .from('route_stops')
      .select('*')
      .in('route_id', routeIds);

    const stops = allStops || [];
    const totalKm = allRoutes.reduce((acc, r) => acc + Number(r.total_distance_km || 0), 0);
    const completedKm = completedRoutes.reduce((acc, r) => acc + Number(r.total_distance_km || 0), 0);
    const totalDuration = allRoutes.reduce((acc, r) => acc + Number(r.estimated_duration_min || 0), 0);

    return {
      totalKm: Math.round(totalKm * 10) / 10,
      completedKm: Math.round(completedKm * 10) / 10,
      totalDuration,
      avgKmPerDelivery: stops.length > 0 ? Math.round((totalKm / stops.length) * 10) / 10 : 0,
      avgDeliveriesPerRoute: allRoutes.length > 0 ? Math.round((stops.length / allRoutes.length) * 10) / 10 : 0,
      totalDeliveries: stops.length,
      totalRoutes: allRoutes.length,
      completedRoutes: completedRoutes.length,
    };
  }


  async getKmByDay(userId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: routes } = await this.db.client
      .from('routes')
      .select('created_at, total_distance_km')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const grouped: Record<string, number> = {};
    (routes || []).forEach((r) => {
      const date = new Date(r.created_at).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + (r.total_distance_km || 0);
    });

    return Object.entries(grouped).map(([date, km]) => ({ date, km: Math.round(km * 10) / 10 }));
  }

  async getDeliveriesByWeek(userId: string, weeks = 12) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - weeks * 7);

    const { data: routes } = await this.db.client
      .from('routes')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    const routeIds = (routes || []).map((r) => r.id);

    const { data: stops } = await this.db.client
      .from('route_stops')
      .select('route_id')
      .in('route_id', routeIds);

    const routeMap: Record<string, string> = {};
    (routes || []).forEach((r) => {
      routeMap[r.id] = r.created_at;
    });

    const grouped: Record<string, number> = {};
    (stops || []).forEach((s) => {
      const date = new Date(routeMap[s.route_id]);
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = weekStart.toISOString().split('T')[0];
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([week, deliveries]) => ({ week, deliveries }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }

  async getRouteCompletion(userId: string) {
    const { data: routes } = await this.db.client
      .from('routes')
      .select('status')
      .eq('user_id', userId);

    const allRoutes = routes || [];
    const completed = allRoutes.filter((r) => r.status === 'completed').length;
    const cancelled = allRoutes.filter((r) => r.status === 'cancelled').length;
    const active = allRoutes.filter((r) => r.status === 'active').length;

    return {
      completed,
      cancelled,
      active,
      total: allRoutes.length,
    };
  }
}
