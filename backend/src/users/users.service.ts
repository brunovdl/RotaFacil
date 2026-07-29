import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string) {
    const { data, error } = await this.db.client
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return data;
  }

  async updateProfile(id: string, data: { name?: string; email?: string }) {
    const { data: updated, error } = await this.db.client
      .from('users')
      .update(data)
      .eq('id', id)
      .select('id, name, email, created_at')
      .single();

    if (error) throw error;
    return updated;
  }

  async updatePassword(id: string, hashedPassword: string) {
    const { error } = await this.db.client
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Senha atualizada com sucesso' };
  }

  async deleteAccount(id: string) {
    await this.db.client.from('subscriptions').delete().eq('user_id', id);
    await this.db.client.from('route_stops').delete().eq('route_id', id);
    await this.db.client.from('routes').delete().eq('user_id', id);
    await this.db.client.from('users').delete().eq('id', id);
    return { message: 'Conta encerrada com sucesso' };
  }
}
