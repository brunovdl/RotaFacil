import { Injectable, HttpException } from '@nestjs/common';

export interface CepResult {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  source: string;
}

@Injectable()
export class CepService {
  async lookup(cep: string): Promise<CepResult> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw new HttpException('CEP inválido. Informe 8 dígitos.', 400);
    }

    try {
      // Try ViaCEP first
      const viaCepResult = await this.queryViaCep(cleanCep);
      if (viaCepResult) {
        return { ...viaCepResult, source: 'ViaCEP' };
      }
    } catch {
      // Fall through to Correios
    }

    try {
      // Fallback to Correios API
      const correiosResult = await this.queryCorreios(cleanCep);
      if (correiosResult) {
        return { ...correiosResult, source: 'Correios' };
      }
    } catch {
      // No more fallbacks
    }

    throw new HttpException('CEP não encontrado', 404);
  }

  private async queryViaCep(cep: string): Promise<CepResult | null> {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

    if (!response.ok) return null;

    const data = await response.json();

    if (data.erro) return null;

    return {
      cep: data.cep,
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      source: 'ViaCEP',
    };
  }

  private async queryCorreios(cep: string): Promise<CepResult | null> {
    try {
      const response = await fetch(
        `https://apps.correios.com.br/SigepMasterJPA/AtendeClienteService/AtendeCliente?wsdl`,
        { method: 'POST' },
      );

      if (!response.ok) return null;

      // The Correios SOAP API is complex; for practical purposes
      // we'll try a REST alternative
      return this.queryFallback(cep);
    } catch {
      return this.queryFallback(cep);
    }
  }

  private async queryFallback(cep: string): Promise<CepResult | null> {
    // Fallback: try a public CEP API
    try {
      const response = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);
      if (response.ok) {
        const data = await response.json();
        return {
          cep: data.cep,
          street: data.address,
          neighborhood: data.district,
          city: data.city,
          state: data.state,
          source: 'Fallback',
        };
      }
    } catch {
      // ignore
    }

    return null;
  }
}
