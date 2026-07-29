import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class DatabaseService implements OnModuleInit {
  public supabase: SupabaseClient;
  private ready = false;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
      throw new InternalServerErrorException(
        'Supabase não configurado. Edite o arquivo backend/.env com suas credenciais do Supabase.',
      );
    }

    if (!supabaseKey || supabaseKey === 'your-anon-key') {
      throw new InternalServerErrorException(
        'Supabase anon key não configurada. Edite o arquivo backend/.env.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }

  async onModuleInit() {
    try {
      const { error } = await this.supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (error && error.code === '42P01') {
        throw new InternalServerErrorException(
          'Tabelas do banco não encontradas. Execute o script supabase-schema.sql no SQL Editor do Supabase.',
        );
      }

      this.ready = true;
      console.log('Supabase conectado com sucesso');
    } catch (err: any) {
      if (err instanceof InternalServerErrorException) throw err;
      throw new InternalServerErrorException(
        `Erro ao conectar no Supabase: ${err.message || 'Verifique suas credenciais e conectividade de rede'}`,
      );
    }
  }

  get client(): SupabaseClient {
    if (!this.ready) {
      throw new InternalServerErrorException('Banco de dados não está pronto');
    }
    return this.supabase;
  }
}
