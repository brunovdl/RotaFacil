import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { VehiclesService } from '../vehicles/vehicles.service';

@Injectable()
export class RouteStopsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly vehiclesService: VehiclesService,
  ) {}

  private async verifyRouteOwner(routeId: string, userId?: string) {
    if (!userId) return;
    const { data: route } = await this.db.client
      .from('routes')
      .select('id')
      .eq('id', routeId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!route) {
      throw new NotFoundException('Rota não encontrada');
    }
  }

  /**
   * Sincroniza o status da rota principal caso todas as paradas estejam concluídas/adiadas
   */
  public async checkAndSyncRouteStatus(routeId: string) {
    const { data: allStops } = await this.db.client
      .from('route_stops')
      .select('id, completed, status')
      .eq('route_id', routeId);

    if (!allStops || allStops.length === 0) return;

    const hasPending = allStops.some((s) => !s.completed && s.status !== 'skipped');

    if (!hasPending) {
      const { data: route } = await this.db.client
        .from('routes')
        .select('user_id, status, total_distance_km')
        .eq('id', routeId)
        .single();

      if (route && route.status !== 'completed') {
        await this.db.client
          .from('routes')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('id', routeId);

        if (route.user_id && route.total_distance_km) {
          await this.vehiclesService.addRouteKmToOdometer(
            route.user_id,
            Number(route.total_distance_km),
          );
        }
      }
    }
  }

  async complete(stopId: string, routeId: string, userId?: string) {
    await this.verifyRouteOwner(routeId, userId);

    const { data, error } = await this.db.client
      .from('route_stops')
      .update({ completed: true, status: 'completed' })
      .eq('id', stopId)
      .eq('route_id', routeId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Parada não encontrada');
    }

    await this.checkAndSyncRouteStatus(routeId);

    return data;
  }

  async reorder(routeId: string, stopIds: string[], userId?: string) {
    await this.verifyRouteOwner(routeId, userId);

    const updates = stopIds.map((id, index) => ({
      id,
      route_id: routeId,
      order_index: index + 1,
    }));

    for (const update of updates) {
      await this.db.client
        .from('route_stops')
        .update({ order_index: update.order_index })
        .eq('id', update.id)
        .eq('route_id', routeId);
    }

    return { message: 'Ordem atualizada' };
  }

  async skip(
    stopId: string,
    routeId: string,
    userId?: string,
    reason?: string,
    notes?: string,
    moveToEnd = true,
  ) {
    await this.verifyRouteOwner(routeId, userId);

    let orderIndexUpdate: number | null = null;

    if (moveToEnd) {
      const { data: stops } = await this.db.client
        .from('route_stops')
        .select('id, order_index')
        .eq('route_id', routeId)
        .order('order_index', { ascending: true });

      if (stops && stops.length > 0) {
        const maxIndex = Math.max(...stops.map((s) => s.order_index || 0));
        orderIndexUpdate = maxIndex + 1;
      }
    }

    const fullUpdate: any = {
      status: 'skipped',
      skip_reason: reason || 'Adiada pelo motorista',
      notes: notes || null,
    };
    if (orderIndexUpdate !== null) {
      fullUpdate.order_index = orderIndexUpdate;
    }

    // 1. Tenta atualização completa com as colunas status / skip_reason / notes
    let { data, error } = await this.db.client
      .from('route_stops')
      .update(fullUpdate)
      .eq('id', stopId)
      .eq('route_id', routeId)
      .select()
      .single();

    // 2. Se falhar por falta de coluna no PostgreSQL, aplica o fallback resiliente
    if (error) {
      console.warn(
        'Supabase update com colunas de adiar falhou, usando fallback de complemento:',
        error.message,
      );

      const fallbackUpdate: any = {};
      if (orderIndexUpdate !== null) {
        fallbackUpdate.order_index = orderIndexUpdate;
      }

      if (reason) {
        const { data: currentStop } = await this.db.client
          .from('route_stops')
          .select('complement')
          .eq('id', stopId)
          .single();

        const origComp = currentStop?.complement || '';
        const tag = `[ADIADA: ${reason}]`;
        if (!origComp.includes('[ADIADA:')) {
          fallbackUpdate.complement = origComp ? `${origComp} ${tag}` : tag;
        }
      }

      const resFallback = await this.db.client
        .from('route_stops')
        .update(fallbackUpdate)
        .eq('id', stopId)
        .eq('route_id', routeId)
        .select()
        .single();

      if (resFallback.error || !resFallback.data) {
        console.error('Erro no fallback de adiar parada:', resFallback.error);
        throw new NotFoundException(
          resFallback.error?.message || 'Parada não encontrada',
        );
      }

      data = resFallback.data;
      data.status = 'skipped';
      data.skip_reason = reason || 'Adiada pelo motorista';
    }

    await this.checkAndSyncRouteStatus(routeId);

    return data;
  }

  async resume(stopId: string, routeId: string, userId?: string) {
    await this.verifyRouteOwner(routeId, userId);

    let { data, error } = await this.db.client
      .from('route_stops')
      .update({
        completed: false,
        status: 'pending',
        skip_reason: null,
      })
      .eq('id', stopId)
      .eq('route_id', routeId)
      .select()
      .single();

    if (error) {
      const { data: currentStop } = await this.db.client
        .from('route_stops')
        .select('complement')
        .eq('id', stopId)
        .single();

      let comp = currentStop?.complement || '';
      if (comp.includes('[ADIADA:')) {
        comp = comp.replace(/\[ADIADA:[^\]]+\]/g, '').trim();
      }

      const resFallback = await this.db.client
        .from('route_stops')
        .update({ complement: comp })
        .eq('id', stopId)
        .eq('route_id', routeId)
        .select()
        .single();

      if (resFallback.error || !resFallback.data) {
        throw new NotFoundException('Parada não encontrada');
      }

      data = resFallback.data;
      data.status = 'pending';
      data.skip_reason = null;
    }

    // Se reabrir uma parada, a rota volta para ativa caso estivesse concluída
    await this.db.client
      .from('routes')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', routeId);

    return data;
  }

  async getNextStop(routeId: string, userId?: string) {
    await this.verifyRouteOwner(routeId, userId);

    const { data, error } = await this.db.client
      .from('route_stops')
      .select('*')
      .eq('route_id', routeId)
      .eq('completed', false)
      .neq('status', 'skipped')
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (error || !data) {
      return { message: 'Todas as paradas foram concluídas ou puladas' };
    }

    return data;
  }
}
