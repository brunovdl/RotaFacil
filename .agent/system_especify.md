# Plano de Desenvolvimento — Micro-SaaS de Roteirização para Entregadores Autônomos

## Idéia Geral

### Nome provisório

**RotaFácil** — Micro-SaaS para organização inteligente de entregas.

### Objetivo

Criar uma aplicação **web responsiva para dispositivos móveis** voltada para **motoristas autônomos**, permitindo cadastrar vários endereços de entrega e gerar automaticamente a **melhor ordem de visitas com base na menor distância**, utilizando a **localização atual do motorista via GPS**.

O sistema não realizará rastreamento em tempo real nem comprovação de entrega. O foco é **roteirização simples, rápida e econômica**.

---

## Proposta de valor

* Redução de quilômetros percorridos
* Economia de combustível
* Menos tempo organizando entregas manualmente
* Interface simples para uso diário no celular
* Integração com **Google Maps** e **Waze** com apenas um toque
* Busca automática de endereço via **CEP utilizando API dos Correios**

---

## Público-alvo

* Motoristas autônomos
* Entregadores de e-commerce
* Motoboys
* Motoristas de pequenas encomendas
* Prestadores de serviços de entrega local

---

## Modelo de negócio

| Item            | Definição                          |
| --------------- | ---------------------------------- |
| Tipo            | SaaS (Software como Serviço)       |
| Cobrança        | Assinatura mensal                  |
| Teste grátis    | 7 dias                             |
| Multiempresa    | Não                                |
| Escopo da conta | Individual (1 motorista por conta) |

---

## Arquitetura recomendada

### Frontend

| Tecnologia                          | Motivo                                                       |
| ----------------------------------- | ------------------------------------------------------------ |
| **Next.js 15 + React + TypeScript** | Moderno, rápido, excelente experiência mobile e SEO          |
| **Tailwind CSS**                    | Desenvolvimento ágil e interface responsiva                  |
| **PWA (Progressive Web App)**       | Instalação no celular sem necessidade de loja de aplicativos |

### Backend

| Tecnologia              | Motivo                                                    |
| ----------------------- | --------------------------------------------------------- |
| **NestJS (TypeScript)** | Estrutura robusta, escalável e organizada                 |
| **Supabase**            | Banco PostgreSQL, autenticação e armazenamento integrados |

### Mapas e roteirização

| Serviço                                | Escolha                     |
| -------------------------------------- | --------------------------- |
| **OpenStreetMap**                      | Gratuito                    |
| **OSRM (Open Source Routing Machine)** | Cálculo de rotas sem custo  |
| **Nominatim**                          | Geocodificação complementar |

### Integração de CEP

| Serviço              | Uso                                               |
| -------------------- | ------------------------------------------------- |
| **API ViaCEP**       | Busca principal                                   |
| **API dos Correios** | Validação complementar e confiabilidade dos dados |

---

# Telas do App

## 1. Tela de Boas-vindas

### Objetivo

Apresentar o produto e incentivar o cadastro.

### Elementos

* Logo
* Texto explicativo
* Botão **Criar conta**
* Botão **Entrar**
* Destaque para **7 dias grátis**

---

## 2. Cadastro / Login

### Funcionalidades

* Cadastro por e-mail e senha
* Login
* Recuperação de senha
* Aceite de termos de uso

### Campos

* Nome
* E-mail
* Senha
* Confirmar senha

---

## 3. Dashboard

### Objetivo

Resumo rápido do dia.

### Informações exibidas

* Total de entregas cadastradas
* Rotas criadas hoje
* Km estimados da rota atual
* Tempo estimado da rota
* Botão **Nova rota**

### Layout mobile

* Cards empilhados verticalmente
* Botão flutuante de ação rápida

---

## 4. Nova Rota

### Fluxo

1. Obter localização atual
2. Nomear a rota
3. Adicionar endereços
4. Gerar otimização

### Campos

* Nome da rota
* Observação opcional

---

## 5. Cadastro de Endereço

### Funcionalidade principal

Cadastro **manual** com preenchimento automático por CEP.

### Campos

| Campo       | Obrigatório |
| ----------- | ----------- |
| CEP         | Sim         |
| Número      | Sim         |
| Complemento | Não         |
| Bairro      | Automático  |
| Cidade      | Automático  |
| Estado      | Automático  |

### Comportamento

1. Usuário digita o CEP
2. Sistema consulta **ViaCEP**
3. Se necessário, valida nos **Correios**
4. Endereço é preenchido automaticamente
5. Usuário informa apenas o número

### Ações

* **Adicionar à rota**
* **Adicionar outro endereço**

---

## 6. Lista de Paradas

### Exibição

| Ordem | Endereço   | Distância |
| ----- | ---------- | --------- |
| 1     | Rua A, 123 | 2,1 km    |
| 2     | Rua B, 456 | 1,4 km    |
| 3     | Rua C, 789 | 3,0 km    |

### Funcionalidades

* Reordenar manualmente
* Remover parada
* Editar endereço
* Marcar como concluída

---

## 7. Tela de Rota Otimizada

### Informações principais

* Distância total
* Tempo estimado
* Quantidade de paradas
* Economia estimada comparada à ordem original

### Mapa

Mapa simples com:

* Ponto inicial (GPS atual)
* Marcadores numerados
* Linha da rota otimizada

### Botões principais

* **Iniciar no Google Maps**
* **Iniciar no Waze**
* **Copiar sequência**
* **Salvar rota**

---

## 8. Navegação Sequencial

### Funcionamento

Ao tocar em **Próxima parada**:

1. Abre o aplicativo escolhido
2. Navega para o endereço atual
3. Ao retornar ao sistema, a parada é marcada como concluída
4. O próximo endereço fica disponível automaticamente

### Integrações

#### Google Maps

```text
https://www.google.com/maps/dir/?api=1&destination=LAT,LNG
```

#### Waze

```text
https://waze.com/ul?ll=LAT,LNG&navigate=yes
```

---

## 9. Histórico de Rotas

### Objetivo

Permitir reutilizar e consultar rotas anteriores.

### Informações

* Nome da rota
* Data
* Quantidade de entregas
* Distância total
* Tempo estimado
* Status (Concluída / Em andamento)

### Ações

* Duplicar rota
* Excluir
* Reabrir rota
* Exportar CSV

---

## 10. Relatórios

### Indicadores principais

#### Operacionais

* Entregas por dia
* Entregas por semana
* Entregas por mês
* Rotas criadas
* Rotas concluídas

#### Desempenho

* Km percorridos
* Tempo estimado total
* Média de km por entrega
* Média de entregas por rota

#### Financeiros estimados

* Combustível economizado
* Distância evitada pela otimização

### Gráficos sugeridos

* Linha: km por dia
* Barras: entregas por semana
* Pizza: rotas concluídas vs canceladas

---

## 11. Configurações

### Opções

* Dados pessoais
* Alterar senha
* Aplicativo de navegação padrão
* Unidade de distância (km)
* Gerenciar assinatura
* Encerrar conta

---

# Requisitos e Funções

## Requisitos Funcionais

### RF001 — Cadastro de usuário

* Criar conta individual
* Autenticação segura
* Recuperação de senha

### RF002 — Captura de localização

* Solicitar permissão de GPS
* Obter latitude e longitude atuais
* Atualizar ponto de partida

### RF003 — Cadastro de endereços

* Inserção manual
* Busca por CEP
* Preenchimento automático
* Edição e remoção

### RF004 — Integração com CEP

#### Fluxo obrigatório

```text
Usuário informa CEP
       ↓
Consulta ViaCEP
       ↓
Sucesso?
   ↓         ↓
 Sim        Não
 ↓           ↓
Preenche   Consulta Correios
```

### RF005 — Geocodificação

Converter endereço em coordenadas:

```text
Rua + Número + Cidade + Estado
            ↓
      Latitude / Longitude
```

### RF006 — Otimização de rota

#### Entrada

* Localização atual
* Lista de coordenadas das entregas

#### Saída

* Ordem otimizada
* Distância total
* Tempo estimado

### RF007 — Navegação externa

* Abrir Google Maps
* Abrir Waze
* Navegação parada a parada

### RF008 — Conclusão de parada

* Marcar entrega como concluída
* Avançar automaticamente para a próxima

### RF009 — Relatórios

* Agregação diária, semanal e mensal
* Métricas de distância e produtividade

### RF010 — Assinatura

* Controle de teste grátis
* Validação de plano ativo
* Bloqueio após expiração

---

## Requisitos Não Funcionais

| Requisito             | Meta                     |
| --------------------- | ------------------------ |
| Tempo de carregamento | < 2 segundos             |
| Responsividade        | 100% funcional em 360px+ |
| Disponibilidade       | 99%                      |
| Segurança             | JWT + HTTPS              |
| Escalabilidade        | Até 10 mil usuários      |
| PWA                   | Suporte offline parcial  |

---

## Estrutura do Banco (Supabase)

### Tabela: users

| Campo      | Tipo      | Observação                       |
| ---------- | --------- | -------------------------------- |
| id         | uuid      | Chave primária (Auth UUID)       |
| name       | text      | Nome completo do motorista       |
| email      | text      | E-mail único                     |
| password   | text      | Hash da senha (bcrypt)           |
| created_at | timestamp | Data de criação da conta (UTC)   |

### Tabela: routes

| Campo                  | Tipo      | Observação                                           |
| ---------------------- | --------- | ---------------------------------------------------- |
| id                     | uuid      | Chave primária                                       |
| user_id                | uuid      | FK -> users(id) ON DELETE CASCADE                    |
| name                   | text      | Nome identificador da rota                           |
| start_lat              | numeric   | Latitude do ponto de partida (GPS inicial)           |
| start_lng              | numeric   | Longitude do ponto de partida (GPS inicial)          |
| total_distance_km      | numeric   | Distância total calculada em km (default: 0)         |
| estimated_duration_min | integer   | Tempo estimado em minutos (default: 0)               |
| status                 | text      | Status: 'active', 'completed', 'cancelled'           |
| created_at             | timestamp | Data de geração da rota (UTC)                        |

### Tabela: route_stops

| Campo        | Tipo    | Observação                                           |
| ------------ | ------- | ---------------------------------------------------- |
| id           | uuid    | Chave primária                                       |
| route_id     | uuid    | FK -> routes(id) ON DELETE CASCADE                   |
| order_index  | integer | Ordem sequencial na rota (1, 2, 3...)                |
| cep          | text    | CEP da entrega (8 dígitos)                           |
| street       | text    | Logradouro / Rua                                     |
| number       | text    | Número do imóvel                                     |
| complement   | text    | Complemento (apto, bloco, etc. - opcional)           |
| neighborhood | text    | Bairro                                               |
| city         | text    | Cidade / Município                                   |
| state        | text    | UF (Estado com 2 letras)                             |
| lat          | numeric | Latitude obtida por geocodificação                   |
| lng          | numeric | Longitude obtida por geocodificação                  |
| completed    | boolean | Indica se a entrega foi marcada como concluída       |

### Tabela: subscriptions

| Campo         | Tipo      | Observação                                           |
| ------------- | --------- | ---------------------------------------------------- |
| id            | uuid      | Chave primária                                       |
| user_id       | uuid      | FK -> users(id) ON DELETE CASCADE                    |
| plan          | text      | Plano atual ('trial', 'monthly', 'annual')           |
| trial_ends_at | timestamp | Data/hora de expiração do teste grátis (7 dias)      |
| active        | boolean   | Status da assinatura (true/false)                    |

---

## Algoritmo de Roteirização

### Estratégia Implementada (MVP)

#### Nearest Neighbor (Vizinho Mais Próximo) + Fórmula de Haversine

* **Distância entre Coordenadas**: Calculada via Fórmula de Haversine (distância esférica em km considerando o raio médio da Terra $R = 6371\text{ km}$).
* **Estimativa de Tempo**: $Tempo (min) = \text{Math.round}(\text{Distância Total em km} \times 2)$.
* **Ordem de Execução**:
  1. Define o ponto inicial $P_0 = (\text{start\_lat}, \text{start\_lng})$.
  2. Encontra a parada restante com menor distância de Haversine a partir de $P_{atual}$.
  3. Adiciona a parada à sequência otimizada e atribui o `order_index`.
  4. Atualiza $P_{atual}$ para as coordenadas da parada recém-adicionada.
  5. Repete até que todas as paradas sejam ordenadas.

#### Vantagens

* Execução ultrarrápida no backend NestJS ($< 10\text{ ms}$ para 100 paradas).
* Sem custos computacionais com APIs externas de matriz de distâncias.
* Redução garantida da distância percorrida em relação à ordem arbitrária.

### Evolução futura

* Otimização 2-Opt para eliminação de cruzamentos de rotas.
* Matriz de tempo real via OSRM (Open Source Routing Machine) / GraphHopper.
* Suporte a restrições de horário de entrega (Time Windows).

---

## Especificação Técnica de APIs e Integrações

### 1. Endpoints do Backend (NestJS)

#### Autenticação (`/auth`)
* `POST /auth/register`: Cadastro de novo usuário (cria o usuário e gera registro de trial de 7 dias em `subscriptions`).
* `POST /auth/login`: Autenticação e retorno de JWT Access Token.
* `GET /auth/profile`: Retorna dados do usuário autenticado.

#### Busca por CEP (`/cep`)
* `GET /cep/:cep`: Consulta os dados do endereço pelo CEP.
  - **Fluxo de Fallback**: ViaCEP `->` Correios/AwesomeAPI `->` 404 Not Found.

#### Geocodificação (`/geocoding`)
* `GET /geocoding/search?street=...&number=...&city=...&state=...`: Converte endereço em coordenadas `lat/lng`.
* `POST /geocoding/batch`: Processa múltiplos endereços em lote.
  - **Cache**: Respostas são mantidas em cache em memória para evitar requisições redundantes.
  - **Rate Limiting**: Delay de 200 ms entre requisições ao Nominatim (OpenStreetMap).
  - **Fallback**: Se o logradouro exato não for localizado, recua para as coordenadas do município/centro do estado.

#### Rotas (`/routes`)
* `POST /routes`: Cria uma nova rota com otimização automática Nearest Neighbor.
* `GET /routes?page=1&limit=20`: Lista rotas paginadas do usuário.
* `GET /routes/:id`: Detalhes de uma rota com suas paradas ordenadas.
* `PATCH /routes/:id/status`: Atualiza o status (`active`, `completed`, `cancelled`).
* `POST /routes/:id/duplicate`: Duplica uma rota existente.
* `DELETE /routes/:id`: Remove a rota e suas paradas.

#### Paradas (`/route-stops`)
* `PATCH /route-stops/:id/complete`: Alterna/marca status de conclusão da entrega (`completed = true/false`).

#### Relatórios (`/reports`)
* `GET /reports/summary`: Métricas consolidadas (entregas totais, km percorridos, tempo estimado, economia de combustível estimada).

#### Assinaturas (`/subscriptions`)
* `GET /subscriptions/status`: Consulta status da assinatura e dias restantes de trial.

---

### 2. Formato de Deeplinks para Navegação Externa

#### Google Maps
* **Próxima Parada Única**:
  `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`
* **Rota Completa com Múltiplos Waypoints**:
  `https://www.google.com/maps/dir/?api=1&origin={start_lat},{start_lng}&destination={end_lat},{end_lng}&waypoints={lat1},{lng1}%7C{lat2},{lng2}`

#### Waze
* **Próxima Parada**:
  `https://waze.com/ul?ll={lat},{lng}&navigate=yes`

---

### 3. Regras de Controle de Acesso e Assinatura

* **Período de Teste Grátis**: 7 dias a partir da data `users.created_at`.
* **Bloqueio de Trial Expirado**: Ao expirar os 7 dias sem plano ativo, rotas de escrita (`POST /routes`) retornam erro de permissão (402 Payment Required / 403 Forbidden), mantendo o histórico em modo leitura.

---

# Observações extras

## Fluxo Completo do Usuário

```text
Login
  ↓
Nova rota
  ↓
Capturar GPS atual
  ↓
Adicionar CEP + número
  ↓
Sistema preenche endereço
  ↓
Adicionar múltiplas paradas
  ↓
Gerar rota otimizada
  ↓
Visualizar sequência
  ↓
Escolher Google Maps ou Waze
  ↓
Navegar parada a parada
  ↓
Marcar concluída
  ↓
Visualizar relatório posteriormente
```

---

## Roadmap de Desenvolvimento

### Fase 1 — MVP (2 a 3 semanas)

* Autenticação
* Cadastro manual de endereços
* ViaCEP
* Captura de GPS
* Otimização por menor distância
* Integração Google Maps/Waze
* Histórico simples

### Fase 2 — Beta (1 a 2 semanas)

* Relatórios completos
* PWA instalável
* Exportação CSV
* Melhorias de UX mobile

### Fase 3 — Versão Comercial

* Cobrança recorrente
* Notificações push
* Reutilização de rotas frequentes
* Compartilhamento de rota
* Backup automático

---

## Sugestão de Interface Mobile

### Navegação inferior

```text
[Início] [Rotas] [+] [Relatórios] [Conta]
```

### Tela principal

```text
┌────────────────────┐
│ Boa noite, Bruno   │
├────────────────────┤
│ 12 entregas hoje   │
│ 18,4 km estimados  │
├────────────────────┤
│   + Nova Rota      │
├────────────────────┤
│ Rota Centro        │
│ 8 paradas          │
│ [Continuar]        │
└────────────────────┘
```

---

## Custos Operacionais Estimados

| Serviço       | Custo inicial |
| ------------- | ------------- |
| Vercel        | Gratuito      |
| Supabase      | Gratuito      |
| OpenStreetMap | Gratuito      |
| OSRM público  | Gratuito      |
| ViaCEP        | Gratuito      |
| Domínio       | ~R$ 40/ano    |

### Resultado

É possível operar o MVP com **custo praticamente zero**, pagando apenas domínio e eventualmente upgrade do Supabase conforme o crescimento.

---

## Principais Riscos Técnicos

### Limite de geocodificação

**Mitigação:** cachear coordenadas já consultadas.

### Precisão de CEP

**Mitigação:** permitir ajuste manual do endereço antes de salvar.

### Dependência de GPS do navegador

**Problema identificado em Android:** O Chrome mobile bloqueia geolocalização de alta precisão em contextos HTTP (não-HTTPS). Além disso, `enableHighAccuracy: true` força o chip GPS físico do dispositivo, que pode demorar 30–60 segundos para obter sinal indoor.

**Solução implementada (estratégia de 2 tentativas):**
1. **1ª tentativa** — `enableHighAccuracy: false`, timeout de 8s: usa rede Wi-Fi/celular, funciona em HTTP e é rápida.
2. **2ª tentativa** — `enableHighAccuracy: true`, timeout de 30s, `maximumAge: 60000`: usa chip GPS real como fallback.
3. **Erros diferenciados**: `PERMISSION_DENIED`, `TIMEOUT` e `POSITION_UNAVAILABLE` exibem mensagens distintas.
4. **Modal de coordenadas manuais**: usuário pode inserir lat/lng manualmente (copiado do Google Maps), como alternativa definitiva.

**Mitigação para produção:** Servir o app via **HTTPS** (obrigatório em produção) resolve o problema primário. Em ambiente de desenvolvimento mobile, usar `ngrok` ou similar para tunelar com HTTPS.


---

## Diferenciais Competitivos

* Foco em **motorista autônomo brasileiro**
* Integração nativa com **CEP**
* Fluxo extremamente simples
* Sem necessidade de aplicativo instalado
* Custo operacional muito baixo
* Funciona diretamente no navegador do celular

---

# Escopo Final Aprovado

## Incluído no MVP

* Cadastro e login
* Conta individual
* Captura automática de GPS
* Cadastro manual de endereços
* Busca por CEP
* Integração ViaCEP + Correios
* Geração automática da melhor rota
* Lista sequencial de paradas
* Abertura em Google Maps
* Abertura em Waze
* Navegação sequencial automática
* Marcação de parada concluída
* Histórico de rotas
* Relatórios operacionais
* Assinatura mensal
* Teste grátis de 7 dias
* Interface web responsiva
* PWA instalável

## Fora do escopo inicial

* Rastreamento em tempo real
* Prova de entrega
* Assinatura digital
* Foto da entrega
* Gestão de múltiplos motoristas
* Integrações com marketplaces
* Aplicativos nativos Android/iOS

---

# Conclusão

O projeto definido possui características ideais para um **micro-SaaS enxuto, validável rapidamente e com baixo custo de infraestrutura**.

A combinação **Next.js + NestJS + Supabase + OpenStreetMap/OSRM** oferece:

* **Custo inicial quase zero**
* **Stack moderna e totalmente em TypeScript**
* **Excelente experiência mobile**
* **Facilidade de manutenção**
* **Escalabilidade suficiente para milhares de entregadores autônomos**

O MVP proposto é tecnicamente viável em **3 a 5 semanas de desenvolvimento**, já permitindo lançamento comercial com **teste grátis de 7 dias e cobrança recorrente mensal**.