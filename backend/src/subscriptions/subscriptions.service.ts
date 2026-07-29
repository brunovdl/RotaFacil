import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly db: DatabaseService) {}

  async getSubscription(userId: string) {
    const { data, error } = await this.db.client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Assinatura não encontrada');
    }

    const trialEnd = new Date(data.trial_ends_at);
    const now = new Date();
    const isExpired = !data.active && trialEnd < now;

    return {
      ...data,
      isExpired,
      daysRemaining: data.active
        ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
    };
  }

  async activateSubscription(userId: string, plan: string = 'monthly') {
    const trialEnd = new Date();
    trialEnd.setMonth(trialEnd.getMonth() + 1);

    const { data: existing } = await this.db.client
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data, error } = await this.db.client
        .from('subscriptions')
        .update({ plan, active: true, trial_ends_at: trialEnd.toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const { data, error } = await this.db.client
      .from('subscriptions')
      .insert({
        id: uuidv4(),
        user_id: userId,
        plan,
        trial_ends_at: trialEnd.toISOString(),
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async cancelSubscription(userId: string) {
    const { data, error } = await this.db.client
      .from('subscriptions')
      .update({ active: false })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
