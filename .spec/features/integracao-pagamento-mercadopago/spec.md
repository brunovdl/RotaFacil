# Spec: Integracao pagamento mercadopago

> feature: integracao-pagamento-mercadopago
> status: rascunho

## Contexto

Integração nativa de pagamento recorrente (assinatura mensal de R$ 15,00) com Mercado Pago via PIX (QR Code estático/dinâmico e Copia e Cola) e Cartão de Crédito com renovação automática de 30 dias e recepção resiliente de Webhooks de notificação.

## Histórias

### US-014 — Geração e pagamento via PIX Mercado Pago

Como motorista autônomo, quero gerar um QR Code do PIX no valor de R$ 15,00 para assinar a plataforma RotaFácil, para que minha conta seja ativada instantaneamente após o pagamento.

#### AC-026 — Geração de QR Code PIX e chave Copia e Cola

- **Dado** que o motorista escolhe a opção de pagamento por PIX na modal de assinatura
- **Quando** ele confirma seu e-mail e CPF
- **Então** o sistema envia o payload ao endpoint `/v1/payments` do Mercado Pago com `payment_method_id = 'pix'` e header `X-Idempotency-Key`, retornando o QR Code base64 e a chave Copia e Cola.

#### AC-027 — Liberação automática da conta via Webhook do Mercado Pago

- **Dado** que o pagamento por PIX foi efetuado pelo motorista no aplicativo de seu banco
- **Quando** o Mercado Pago dispara o Webhook de notificação (`action: payment.created` / `status: approved`)
- **Então** o backend identifica o `external_reference` (user_id), atualiza o plano da assinatura para `monthly` e estende a validade (`paid_until`) por 30 dias.

### US-015 — Processamento de pagamento por Cartão de Crédito

Como motorista, quero cadastrar meu cartão de crédito para cobrança automática mensal, para não ter que renovar manualmente todo mês.

#### AC-028 — Transação com token de cartão de crédito seguro

- **Dado** que o motorista preenche os dados do cartão de crédito no Checkout Transparente
- **Quando** o token do cartão é submetido
- **Então** o sistema realiza a chamada à API do Mercado Pago enviando o token de segurança, identificação do pagador e idempotência, ativando a assinatura imediatamente se a transação for aprovada (`status = approved`).

#### AC-029 — Tratamento de cartão recusado ou saldo insuficiente

- **Dado** que a transação de cartão de crédito foi recusada pela operadora ou banco emissor
- **Quando** a API do Mercado Pago retorna status `rejected` ou `in_process`
- **Então** o sistema salva o histórico do erro, exibe uma mensagem explicativa com o detalhe do recuso e mantém o modal de pagamento aberto para nova tentativa.

### US-016 — Consulta de status de transação em tempo real

Como motorista aguardando na tela de confirmação de pagamento, quero que o aplicativo cheque o status do meu Pix a cada poucos segundos, para que eu seja direcionado ao Dashboard assim que o pagamento for aprovado.

#### AC-030 — Polling resiliente de status do pagamento

- **Dado** que o QR Code do PIX está sendo exibido na tela
- **Quando** o frontend faz polling para o endpoint `GET /subscriptions/status` ou `GET /subscriptions/check-payment/:paymentId`
- **Então** o backend verifica o status no Mercado Pago e retorna `approved: true` quando a transação é confirmada, atualizando a interface em tempo real.

## Fora de escopo

- Suporte a boleto bancário impresso com prazo de compensação de 3 dias no MVP.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-007 | Em ambiente dev sem `MERCADO_PAGO_ACCESS_TOKEN` configurado, o sistema executa modo de simulação (Mock Payment) para aprovação instantânea nos testes. | confirmada | Implementado no SubscriptionsService |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-007 | O webhook de notificação deve validar a assinatura secreta HTTP enviada pelo Mercado Pago para evitar requisições forjadas? | respondida | Sim, validar cabeçalho x-signature no backend em produção. |
