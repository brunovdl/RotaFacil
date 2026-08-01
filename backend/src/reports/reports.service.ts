import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async getOperational(userId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfWeekStr = startOfWeek.toISOString();

    // Consultas paralelas segmentadas por período — evita trazer todas as rotas na memória
    const [{ data: dailyRoutes }, { data: weeklyRoutes }, { data: monthlyRoutes }] =
      await Promise.all([
        this.db.client
          .from('routes')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', startOfDay),
        this.db.client
          .from('routes')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', startOfWeekStr),
        this.db.client
          .from('routes')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', startOfMonth),
      ]);

    const dailyRouteIds = (dailyRoutes || []).map((r) => r.id);
    const weeklyRouteIds = (weeklyRoutes || []).map((r) => r.id);
    const monthlyRouteIds = (monthlyRoutes || []).map((r) => r.id);

    // Contagem de paradas por período — queries paralelas com COUNT no banco
    const [{ count: dailyDeliveries }, { count: weeklyDeliveries }, { count: monthlyDeliveries }] =
      await Promise.all([
        dailyRouteIds.length > 0
          ? this.db.client
              .from('route_stops')
              .select('*', { count: 'exact', head: true })
              .in('route_id', dailyRouteIds)
          : Promise.resolve({ count: 0 }),
        weeklyRouteIds.length > 0
          ? this.db.client
              .from('route_stops')
              .select('*', { count: 'exact', head: true })
              .in('route_id', weeklyRouteIds)
          : Promise.resolve({ count: 0 }),
        monthlyRouteIds.length > 0
          ? this.db.client
              .from('route_stops')
              .select('*', { count: 'exact', head: true })
              .in('route_id', monthlyRouteIds)
          : Promise.resolve({ count: 0 }),
      ]);

    return {
      daily: {
        deliveries: dailyDeliveries || 0,
        routes: dailyRouteIds.length,
      },
      weekly: {
        deliveries: weeklyDeliveries || 0,
        routes: weeklyRouteIds.length,
      },
      monthly: {
        deliveries: monthlyDeliveries || 0,
        routes: monthlyRouteIds.length,
      },
    };
  }

  async getPerformance(userId: string) {
    // Busca apenas campos necessários — evita SELECT *
    const { data: routes } = await this.db.client
      .from('routes')
      .select('id, status, total_distance_km, estimated_duration_min')
      .eq('user_id', userId);

    const allRoutes = routes || [];
    const completedRoutes = allRoutes.filter((r) => r.status === 'completed');
    const routeIds = allRoutes.map((r) => r.id);

    const { count: totalDeliveries } =
      routeIds.length > 0
        ? await this.db.client
            .from('route_stops')
            .select('*', { count: 'exact', head: true })
            .in('route_id', routeIds)
        : { count: 0 };

    const totalKm = allRoutes.reduce((acc, r) => acc + Number(r.total_distance_km || 0), 0);
    const completedKm = completedRoutes.reduce(
      (acc, r) => acc + Number(r.total_distance_km || 0),
      0,
    );
    const totalDuration = allRoutes.reduce(
      (acc, r) => acc + Number(r.estimated_duration_min || 0),
      0,
    );
    const stops = totalDeliveries || 0;

    return {
      totalKm: Math.round(totalKm * 10) / 10,
      completedKm: Math.round(completedKm * 10) / 10,
      totalDuration,
      avgKmPerDelivery: stops > 0 ? Math.round((totalKm / stops) * 10) / 10 : 0,
      avgDeliveriesPerRoute:
        allRoutes.length > 0 ? Math.round((stops / allRoutes.length) * 10) / 10 : 0,
      totalDeliveries: stops,
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

    const { data: stops } =
      routeIds.length > 0
        ? await this.db.client
            .from('route_stops')
            .select('route_id')
            .in('route_id', routeIds)
        : { data: [] };

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
    // Busca somente a coluna status — evita SELECT *
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
