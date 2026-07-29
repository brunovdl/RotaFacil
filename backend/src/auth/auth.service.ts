import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  private get jwtSecret(): string {
    return process.env.JWT_SECRET || 'rotafacil-super-secret-jwt-key-2024';
  }

  async register(dto: RegisterDto) {
    try {
      const { data: existingUser } = await this.db.client
        .from('users')
        .select('id')
        .eq('email', dto.email)
        .maybeSingle();

      if (existingUser) {
        throw new ConflictException('E-mail já cadastrado');
      }

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const userId = uuidv4();

      const { error: insertError } = await this.db.client.from('users').insert({
        id: userId,
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
      });

      if (insertError) {
        if (insertError.code === '23505') {
          throw new ConflictException('E-mail já cadastrado');
        }
        throw new Error(`Erro ao criar usuário: ${insertError.message}`);
      }

      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);

      const { error: subError } = await this.db.client.from('subscriptions').insert({
        id: uuidv4(),
        user_id: userId,
        plan: 'trial',
        trial_ends_at: trialEnd.toISOString(),
        active: true,
      });

      if (subError) {
        throw new Error(`Erro ao criar assinatura: ${subError.message}`);
      }

      const token = this.generateToken({ id: userId, email: dto.email });

      return {
        user: { id: userId, name: dto.name, email: dto.email },
        token,
      };
    } catch (err: any) {
      if (err instanceof ConflictException) throw err;
      if (err.message?.includes('fetch')) {
        throw new Error(
          'Erro de conexão com o banco de dados. Verifique se o Supabase está ativo e as credenciais no .env estão corretas.',
        );
      }
      throw err;
    }
  }

  async login(dto: LoginDto) {
    try {
      const { data: user } = await this.db.client
        .from('users')
        .select('*')
        .eq('email', dto.email)
        .maybeSingle();

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const { data: sub } = await this.db.client
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (sub) {
        const trialEnd = new Date(sub.trial_ends_at);
        const now = new Date();
        if (!sub.active && trialEnd < now) {
          throw new UnauthorizedException('Assinatura expirada');
        }
      }

      const token = this.generateToken({ id: user.id, email: user.email });

      return {
        user: { id: user.id, name: user.name, email: user.email },
        token,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      if (err.message?.includes('fetch')) {
        throw new Error(
          'Erro de conexão com o banco de dados. Verifique se o Supabase está ativo e as credenciais no .env estão corretas.',
        );
      }
      throw err;
    }
  }

  generateToken(payload: { id: string; email: string }): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });
  }
}
