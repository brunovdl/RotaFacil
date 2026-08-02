# Spec: Historico relatorios

> feature: historico-relatorios
> status: rascunho

## Contexto

Consulta a rotas anteriores (duplicação, reabertura, exclusão, exportação CSV) e exibição de relatórios operacionais e financeiros (km percorridos, entregas realizadas e estimativa de economia de combustível).

## Histórias

### US-012 — Histórico e gestão de rotas passadas

Como motorista, quero consultar minhas rotas realizadas e reutilizá-las ou exportá-las, para economizar tempo na organização de jornadas recorrentes.

#### AC-022 — Listagem de rotas com status e filtros

- **Dado** que o motorista acessa a tela de Histórico
- **Quando** a lista é carregada
- **Então** o sistema exibe as rotas ordenadas por data com nome, quantidade de entregas, km total, tempo estimado e status (`ativa`, `concluida`, `cancelada`).

#### AC-023 — Duplicação de rota existente para reuso

- **Dado** uma rota do histórico
- **Quando** o motorista seleciona a opção "Duplicar Rota"
- **Então** o sistema cria uma cópia com as mesmas paradas e endereço de partida para ser reutilizada sem precisar digitar os dados novamente.

#### AC-024 — Exportação de rota para arquivo CSV

- **Dado** uma rota concluída ou em andamento
- **Quando** o motorista clica em "Exportar CSV"
- **Então** o sistema gera o download de um arquivo `.csv` formatado contendo a ordem das paradas, endereços e status.

### US-013 — Dashboard de relatórios e indicadores operacionais

Como motorista autônomo, quero ver relatórios dos meus km percorridos e da minha estimativa de combustível economizado, para entender a redução dos meus custos diários.

#### AC-025 — Cálculo de indicadores de economia e produtividade

- **Dado** o histórico acumulado de entregas do motorista
- **Quando** ele abre o Dashboard de Relatórios
- **Então** o sistema calcula e exibe o total de entregas efetuadas, km rodados e a estimativa de combustível economizado comparado à rota sem otimização.

## Fora de escopo

- Integração direta com sistemas de contabilidade terceirizados no MVP.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-006 | A estimativa de economia de combustível considera o consumo médio de 10 km/litro para veículos urbanos de entrega. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-006 | Os relatórios devem permitir filtragem por período personalizado? | respondida | Filtros fixos rápidos (Hoje, Esta Semana, Este Mês) no MVP. Datas customizadas na Versão 2. |
