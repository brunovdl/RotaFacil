# Spec: Integracao pagamento mercadopago

> feature: integracao-pagamento-mercadopago
> status: implementada

## Contexto

Integração nativa de pagamento de assinatura mensal (R$ 15,00/mês) com Mercado Pago via PIX (QR Code visualizável e chave Copia e Cola com cópia em 1 toque) e Cartão de Crédito. O fluxo garante a exibição obrigatória do QR Code/Copia e Cola e aguarda a confirmação/validação do pagamento (via Webhook ou Polling) antes de liberar a assinatura e o uso do sistema.

## Histórias

### US-014 — Geração e exibição obrigatória de PIX Mercado Pago

Como motorista autônomo com trial de 7 dias expirado ou buscando assinatura, quero visualizar o QR Code do PIX e a chave Copia e Cola na tela sem que a assinatura seja ativada automaticamente antes do pagamento real, para que eu possa pagar no meu aplicativo bancário com segurança.

#### AC-026 — Exibição obrigatória de QR Code PIX e chave Copia e Cola

- **Dado** que o motorista submete seu e-mail e CPF para gerar o pagamento via PIX
- **Quando** o backend retorna os dados do PIX
- **Então** o modal obrigatoriamente permanece aberto exibindo o QR Code (base64 ou gerado a partir da string PIX) e a chave Copia e Cola com botão de cópia em 1 toque, SEM ativar a assinatura nem fechar a tela automaticamente até o pagamento ser confirmado.

#### AC-027 — Liberação automática da conta via Webhook do Mercado Pago

- **Dado** que o pagamento por PIX foi efetuado pelo motorista no aplicativo de seu banco
- **Quando** o Mercado Pago dispara o Webhook de notificação (`action: payment.created` / `status: approved`)
- **Então** o backend identifica o `external_reference` (user_id), atualiza o plano da assinatura para `monthly` e estende a validade (`paid_until`) por 30 dias.

### US-015 — Processamento de pagamento por Cartão de Crédito com Validação

Como motorista, quero pagar via cartão de crédito e ter a validação da aprovação antes do acesso ser liberado.

#### AC-028 — Transação com token de cartão de crédito seguro e validação de aprovação

- **Dado** que o motorista preenche os dados do cartão de crédito no Checkout Transparente
- **Quando** o token do cartão é submetido
- **Então** o sistema realiza a chamada à API do Mercado Pago enviando o token de segurança, ativando a assinatura SOMENTE APÓS a validação da resposta com `status = approved`.

#### AC-029 — Tratamento de cartão recusado ou saldo insuficiente

- **Dado** que a transação de cartão de crédito foi recusada pela operadora ou banco emissor
- **Quando** a API do Mercado Pago retorna status `rejected` ou `in_process`
- **Então** o sistema salva o histórico do erro, exibe uma mensagem explicativa com o detalhe do recuso e mantém o modal de pagamento aberto para nova tentativa.

### US-016 — Polling em tempo real e Bloqueio pós-Trial

Como motorista cujo trial de 7 dias expirou, quero que a tela de cobrança me bloqueie o acesso aos recursos do app até que o pagamento via PIX ou Cartão seja validado pelo polling em tempo real.

#### AC-030 — Polling resiliente de status do pagamento e redirecionamento

- **Dado** que o QR Code do PIX está sendo exibido na tela
- **Quando** o frontend faz polling para o endpoint `GET /subscriptions/check-payment/:paymentId`
- **Então** o backend verifica o status no Mercado Pago e o modal exibe a mensagem de sucesso e libera o acesso ao Dashboard SOMENTE quando a resposta for `approved: true`.

## Fora de escopo

- Suporte a boleto bancário impresso com prazo de compensação de 3 dias no MVP.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-007 | O QR Code do PIX deve sempre ser renderizado visualmente na tela via canvas SVG/PNG, acompanhado da opção Copia e Cola. | confirmada | Implementado com biblioteca qrcode no frontend |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-007 | O webhook de notificação deve validar a assinatura secreta HTTP enviada pelo Mercado Pago para evitar requisições forjadas? | respondida | Sim, validar cabeçalho x-signature no backend em produção. |
