import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RouteStopsService {
  constructor(private readonly db: DatabaseService) {}

  async complete(stopId: string, routeId: string) {
    const { data, error } = await this.db.client
      .from('route_stops')
      .update({ completed: true })
      .eq('id', stopId)
      .eq('route_id', routeId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Parada não encontrada');
    }

    // Check if all stops are completed
    const { data: remaining } = await this.db.client
      .from('route_stops')
      .select('id')
      .eq('route_id', routeId)
      .eq('completed', false);

    if (!remaining || remaining.length === 0) {
      await this.db.client
        .from('routes')
        .update({ status: 'completed' })
        .eq('id', routeId);
    }

    return data;
  }

  async reorder(routeId: string, stopIds: string[]) {
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

  async getNextStop(routeId: string) {
    const { data, error } = await this.db.client
      .from('route_stops')
      .select('*')
      .eq('route_id', routeId)
      .eq('completed', false)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (error || !data) {
      return { message: 'Todas as paradas foram concluídas' };
    }

    return data;
  }
}
