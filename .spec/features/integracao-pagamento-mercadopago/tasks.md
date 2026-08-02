# Tasks: Integracao pagamento mercadopago

> feature: integracao-pagamento-mercadopago

## T-020 — Implementar endpoints de PIX, Cartão e Webhook do Mercado Pago no backend [pendente]

- Refs: US-014, US-015, AC-026, AC-027, AC-028, AC-029
- Arquivos: backend/src/subscriptions/subscriptions.service.ts, backend/src/subscriptions/subscriptions.controller.ts, backend/src/subscriptions/subscriptions.module.ts, backend/src/subscriptions/dto/create-pix-payment.dto.ts, backend/src/subscriptions/dto/create-card-payment.dto.ts
- Esforço: alto

## T-021 — Criar modais de pagamento PIX e Cartão de Crédito com polling no frontend [pendente]

- Refs: US-014, US-015, US-016, AC-026, AC-028, AC-030
- Arquivos: frontend/components/ui/subscription-modal.tsx, frontend/app/(dashboard)/settings/page.tsx
- Esforço: alto

## T-022 — Implementar testes executáveis da integração Mercado Pago [pendente]

- Refs: US-014, US-015, US-016, AC-026, AC-027, AC-028, AC-029, AC-030
- Arquivos: test/integracao-pagamento-mercadopago.spec.test.js
- Esforço: medio
