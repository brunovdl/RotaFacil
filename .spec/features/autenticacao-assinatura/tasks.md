# Tasks: Autenticacao assinatura

> feature: autenticacao-assinatura

## T-001 — Implementar endpoints de registro e login no backend [pendente]

- Refs: US-001, AC-001, AC-002
- Arquivos: backend/src/auth/auth.controller.ts, backend/src/auth/auth.service.ts, backend/src/auth/auth.module.ts, backend/src/auth/dto/login.dto.ts, backend/src/auth/dto/register.dto.ts, backend/src/users/users.service.ts, backend/src/users/users.controller.ts, backend/src/users/users.module.ts, backend/src/common/filters/http-exception.filter.ts
- Esforço: medio

## T-002 — Criar tela de cadastro e login com validação de campos no frontend [pendente]

- Refs: US-001, AC-001, AC-002
- Arquivos: frontend/app/(auth)/login/page.tsx, frontend/app/(auth)/register/page.tsx, frontend/app/(auth)/forgot-password/page.tsx
- Esforço: medio

## T-003 — Implementar middleware/guard de verificação de trial e assinatura [pendente]

- Refs: US-002, AC-003, AC-004
- Arquivos: backend/src/common/guards/auth.guard.ts, backend/src/common/decorators/current-user.decorator.ts, backend/src/config.module.ts, backend/src/subscriptions/subscriptions.service.ts, backend/src/subscriptions/subscriptions.controller.ts, backend/src/subscriptions/subscriptions.module.ts, backend/src/subscriptions/dto/create-card-payment.dto.ts, backend/src/subscriptions/dto/create-pix-payment.dto.ts
- Esforço: medio
