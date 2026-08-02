# Spec: Autenticacao assinatura

> feature: autenticacao-assinatura
> status: rascunho

## Contexto

Gestão de cadastro, login e controle do período de testes (trial de 7 dias) para motoristas autônomos acessarem a plataforma RotaFácil com segurança e isolamento individual por conta.

## Histórias

### US-001 — Cadastro e autenticação de motorista

Como motorista autônomo, quero me cadastrar e realizar login com e-mail e senha, para que eu possa acessar minha conta individual e salvar minhas rotas com segurança.

#### AC-001 — Cadastro de nova conta com período de testes

- **Dado** que um novo motorista preenche o formulário de cadastro com nome, e-mail válido e senha
- **Quando** ele submete o cadastro com sucesso
- **Então** o sistema cria o usuário, inicia automaticamente o período de testes grátis de 7 dias e retorna o token de acesso autenticado (JWT).

#### AC-002 — Autenticação com credenciais válidas

- **Dado** que um motorista já possui conta cadastrada
- **Quando** ele informa seu e-mail e senha corretos na tela de login
- **Então** o sistema valida as credenciais e redireciona o motorista para o Dashboard principal.

### US-002 — Controle de plano e expiração de trial

Como dono da plataforma, quero bloquear a criação de novas rotas quando o trial de 7 dias expirar, para que o motorista seja incentivado a assinar o plano mensal.

#### AC-003 — Acesso liberado durante o período de trial

- **Dado** que o motorista está dentro do período de 7 dias de teste grátis
- **Quando** ele acessa o sistema ou tenta criar uma nova rota
- **Então** o sistema permite o uso normal de todas as funcionalidades de criação e otimização.

#### AC-004 — Bloqueio de funcionalidades após expiração do trial

- **Dado** que o período de 7 dias de teste grátis do motorista expirou sem assinatura ativa
- **Quando** ele tenta criar uma nova rota
- **Então** o sistema bloqueia a ação, exibe um aviso de pagamento necessário e mantém o histórico anterior visível em modo somente leitura.

## Fora de escopo

- Login social via Google / Facebook no MVP.
- Gestão de equipes ou múltiplos motoristas em uma mesma conta.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-001 | O hash de senhas deve ser gerado utilizando Bcrypt no backend NestJS antes de salvar no Supabase. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-001 | Qual gateway de pagamento (Stripe, Mercado Pago ou Asaas) será integrado para a assinatura recorrente após o trial? | respondida | Mercado Pago (PIX + Cartão de Crédito) |
