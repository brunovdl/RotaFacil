import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../database/database.service';
import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  private get mpAccessToken(): string {
    return this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN') || '';
  }

  async getSubscription(userId: string) {
    let { data } = await this.db.client
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data) {
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      const newSub = {
        id: uuidv4(),
        user_id: userId,
        plan: 'trial',
        trial_ends_at: trialEnd.toISOString(),
        active: true,
      };
      const { data: created } = await this.db.client
        .from('subscriptions')
        .insert(newSub)
        .select()
        .single();

      data = created || newSub;
    }

    const now = new Date();
    let isExpired = false;
    let daysRemaining = 0;

    if (data.plan === 'trial') {
      const trialEnd = new Date(data.trial_ends_at);
      isExpired = trialEnd < now;
      daysRemaining = data.active && !isExpired
        ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
    } else if (data.plan === 'monthly') {
      if (data.paid_until) {
        const paidUntil = new Date(data.paid_until);
        isExpired = paidUntil < now;
        daysRemaining = !isExpired
          ? Math.max(0, Math.ceil((paidUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;
      } else {
        isExpired = !data.active;
      }
    }

    return {
      ...data,
      isExpired,
      daysRemaining,
    };
  }

  async activateSubscription(userId: string, plan: string = 'monthly', days: number = 30) {
    const paidUntil = new Date();
    paidUntil.setDate(paidUntil.getDate() + days);

    const { data: existing } = await this.db.client
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { data, error } = await this.db.client
        .from('subscriptions')
        .update({
          plan,
          active: true,
          paid_until: paidUntil.toISOString(),
          last_payment_status: 'approved',
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    const { data, error } = await this.db.client
      .from('subscriptions')
      .insert({
        id: uuidv4(),
        user_id: userId,
        plan,
        trial_ends_at: trialEnd.toISOString(),
        paid_until: paidUntil.toISOString(),
        active: true,
        last_payment_status: 'approved',
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

  async createPixPayment(userId: string, dto: CreatePixPaymentDto) {
    const token = this.mpAccessToken;

    // Se token for padrão de teste não configurado, retornar Pix simulado para dev
    if (!token || token.includes('placeholder') || token.includes('test-access-token')) {
      const mockPaymentId = `mock_pix_${Date.now()}`;
      const mockQrCode = `00020126580014br.gov.bcb.pix0136mock-key-rotafacil-${userId.slice(0, 8)}520400005303986540515.005802BR5920RotaFacil MicroSaaS6009SAO PAULO62070503***6304E2CA`;
      
      await this.db.client
        .from('subscriptions')
        .update({
          last_payment_id: mockPaymentId,
          last_payment_status: 'pending',
          payment_method: 'pix',
        })
        .eq('user_id', userId);

      return {
        paymentId: mockPaymentId,
        status: 'pending',
        qrCode: mockQrCode,
        qrCodeBase64: null,
        ticketUrl: null,
        isMock: true,
      };
    }

    try {
      const payload = {
        transaction_amount: 15.00,
        description: 'Assinatura Mensal RotaFácil (R$ 15,00/mês)',
        payment_method_id: 'pix',
        external_reference: userId,
        notification_url: `${this.configService.get<string>('WEBHOOK_BASE_URL') || ''}/api/subscriptions/webhook`,
        payer: {
          email: dto.email,
          ...(dto.cpf ? { identification: { type: 'CPF', number: dto.cpf.replace(/\D/g, '') } } : {}),
        },
      };

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        this.logger.error(`Mercado Pago Pix Error: ${JSON.stringify(resData)}`);
        throw new BadRequestException(resData.message || 'Erro ao gerar Pix no Mercado Pago');
      }

      const poi = resData.point_of_interaction?.transaction_data;

      await this.db.client
        .from('subscriptions')
        .update({
          last_payment_id: String(resData.id),
          last_payment_status: resData.status,
          payment_method: 'pix',
        })
        .eq('user_id', userId);

      return {
        paymentId: String(resData.id),
        status: resData.status,
        qrCode: poi?.qr_code || '',
        qrCodeBase64: poi?.qr_code_base64 || null,
        ticketUrl: poi?.ticket_url || null,
        isMock: false,
      };
    } catch (err: any) {
      this.logger.error(`Failed to create Pix payment: ${err.message}`);
      throw new BadRequestException(err.message || 'Falha ao comunicar com o Mercado Pago');
    }
  }

  async createCardPayment(userId: string, dto: CreateCardPaymentDto) {
    const token = this.mpAccessToken;

    if (!token || token.includes('placeholder') || token.includes('test-access-token')) {
      // Simulação para ambiente dev sem chave real do MP
      await this.activateSubscription(userId, 'monthly', 30);
      return {
        paymentId: `mock_card_${Date.now()}`,
        status: 'approved',
        message: 'Pagamento de teste aprovado com sucesso!',
        isMock: true,
      };
    }

    try {
      const payload = {
        transaction_amount: 15.00,
        token: dto.token,
        description: 'Assinatura Mensal RotaFácil (R$ 15,00/mês)',
        installments: 1,
        payment_method_id: dto.paymentMethodId,
        external_reference: userId,
        payer: {
          email: dto.email,
          ...(dto.cpf ? { identification: { type: 'CPF', number: dto.cpf.replace(/\D/g, '') } } : {}),
        },
      };

      const response = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Idempotency-Key': uuidv4(),
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        this.logger.error(`Mercado Pago Card Error: ${JSON.stringify(resData)}`);
        throw new BadRequestException(resData.message || 'Erro ao processar cartão de crédito');
      }

      if (resData.status === 'approved') {
        await this.activateSubscription(userId, 'monthly', 30);
      } else {
        await this.db.client
          .from('subscriptions')
          .update({
            last_payment_id: String(resData.id),
            last_payment_status: resData.status,
            payment_method: 'card',
          })
          .eq('user_id', userId);
      }

      return {
        paymentId: String(resData.id),
        status: resData.status,
        statusDetail: resData.status_detail,
        isMock: false,
      };
    } catch (err: any) {
      this.logger.error(`Failed to process card payment: ${err.message}`);
      throw new BadRequestException(err.message || 'Falha ao processar pagamento por cartão');
    }
  }

  async checkPaymentStatus(paymentId: string, userId: string) {
    // Se for mock payment em dev
    if (paymentId.startsWith('mock_pix_')) {
      return { status: 'pending', approved: false };
    }

    const token = this.mpAccessToken;
    if (!token || token.includes('placeholder')) {
      return { status: 'pending', approved: false };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return { status: 'unknown', approved: false };
      }

      const data = await response.json();
      const approved = data.status === 'approved';

      if (approved) {
        const targetUser = data.external_reference || userId;
        await this.activateSubscription(targetUser, 'monthly', 30);
      }

      return {
        status: data.status,
        approved,
      };
    } catch (err: any) {
      return { status: 'error', approved: false };
    }
  }

  async handleWebhook(body: any, query: any) {
    const paymentId = body?.data?.id || query?.id || body?.id;
    const action = body?.action || query?.topic;

    this.logger.log(`Received Webhook Mercado Pago: action=${action}, paymentId=${paymentId}`);

    if (!paymentId) return { received: true };

    const token = this.mpAccessToken;
    if (!token || token.includes('placeholder')) {
      return { received: true };
    }

    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return { received: true };

      const payment = await response.json();
      if (payment.status === 'approved' && payment.external_reference) {
        const userId = payment.external_reference;
        await this.activateSubscription(userId, 'monthly', 30);
        this.logger.log(`Subscription activated via Webhook for user ${userId}`);
      }
    } catch (err: any) {
      this.logger.error(`Webhook processing error: ${err.message}`);
    }

    return { received: true };
  }
}
