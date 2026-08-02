# Spec: Otimizacao rotas

> feature: otimizacao-rotas
> status: rascunho

## Contexto

Algoritmo de otimização de rotas por menor distância acumulada (Nearest Neighbor + Fórmula de Haversine), validação de segurança anti-outliers (>60 km) e renderização visual do itinerário no mapa mobile.

## Histórias

### US-008 — Cálculo da melhor ordem de entrega por menor distância

Como motorista com várias entregas, quero que o sistema ordene minhas paradas automaticamente pela menor distância acumulada a partir do meu ponto inicial, para que eu economize combustível e tempo.

#### AC-014 — Ordenação sequencial por Vizinho Mais Próximo (Nearest Neighbor)

- **Dado** o ponto de partida inicial $P_0$ e uma lista de $N$ paradas com coordenadas lat/lng
- **Quando** o motorista clica em "Otimizar Rota"
- **Então** o algoritmo calcula as distâncias de Haversine, define a sequência otimizada e atribui o `order_index` de 1 a $N$ para cada parada.

#### AC-015 — Validação anti-outliers para paradas distantes (> 60 km)

- **Dado** que uma ou mais paradas possuem coordenadas a mais de 60 km da região da rota (outliers de geocodificação)
- **Quando** a otimização é executada
- **Então** o sistema sinaliza os endereços com alerta visual de divergência e impede que distâncias absurdas distorçam o cálculo geral.

### US-009 — Resumo da rota e mapa de navegação

Como entregador, quero ver a distância total em km, o tempo estimado de viagem e o traçado no mapa, para planejar minha jornada antes de sair.

#### AC-016 — Cálculo de tempo e distância totais da rota

- **Dado** uma rota com paradas ordenadas
- **Quando** a otimização é finalizada
- **Então** o sistema calcula a distância total em km e estimativa de tempo total em minutos ($\text{Tempo} = \text{Distância} \times 2\text{ min/km}$).

#### AC-017 — Renderização de marcadores numerados no mapa

- **Dado** uma rota otimizada salva
- **Quando** o entregador visualiza a tela da rota
- **Então** o mapa exibe o ícone de partida (GPS), os pinos numerados na ordem de entrega e a linha conectando o itinerário.

## Fora de escopo

- Otimização dinâmica considerando trânsito em tempo real no MVP.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-004 | O cálculo de Haversine no NestJS leva menos de 10ms para rotas convencionais de até 100 paradas. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-004 | Devemos implementar o algoritmo 2-Opt para evitar cruzamento de linhas no MVP ou posterior? | respondida | Nearest Neighbor puro no MVP para resposta ultrarrápida (<10ms). 2-Opt fica para versão posterior. |
