# Spec: Execucao navegacao

> feature: execucao-navegacao
> status: rascunho

## Contexto

Execução da rota em campo com navegação externa via deeplinks nativos para Google Maps e Waze, controle sequencial parada a parada e marcação de entregas concluídas com 1 toque.

## Histórias

### US-010 — Navegação externa via Google Maps e Waze

Como motorista dirigindo o veículo, quero abrir a próxima parada diretamente no meu aplicativo de navegação favorito (Google Maps ou Waze), para ser guiado por voz durante a viagem.

#### AC-018 — Abertura de parada individual via Deeplink no Google Maps

- **Dado** que o entregador selecione "Navegar com Google Maps" em uma parada da rota
- **Quando** ele clica no botão de navegação
- **Então** o app abre o deeplink `https://www.google.com/maps/dir/?api=1&destination=LAT,LNG` no dispositivo.

#### AC-019 — Abertura de parada individual via Deeplink no Waze

- **Dado** que o entregador selecione "Navegar com Waze" em uma parada da rota
- **Quando** ele clica no botão de navegação
- **Então** o app abre o deeplink `https://waze.com/ul?ll=LAT,LNG&navigate=yes` no dispositivo.

### US-011 — Progresso sequencial e conclusão de paradas

Como entregador ao concluir um pacote, quero marcar a entrega atual como concluída com um toque, para que o sistema avance para a próxima parada da sequência automaticamente.

#### AC-020 — Marcação de parada concluída e avanço automático

- **Dado** que o entregador entregou o pacote da parada atual
- **Quando** ele toca no botão "Marcar como concluída"
- **Então** o sistema atualiza o status em `route_stops` para `completed = true` e destaca a próxima entrega como destino ativo.

#### AC-021 — Reordenação manual e ajuste em tempo real

- **Dado** que o entregador precisa pular ou reordenar uma entrega por ausência do destinatário
- **Quando** ele arrasta a parada ou seleciona "Pular entrega"
- **Então** o sistema permite a reordenação manual e atualiza os índices da rota sem perder o progresso.

## Fora de escopo

- Coleta de assinatura digital ou foto de comprovante no MVP.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-005 | Os deeplinks de mapas abrem automaticamente o app nativo no Android e iOS quando instalados no celular. | aberta | — |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-005 | Deve haver confirmação com modal ao marcar uma parada como concluída ou o clique deve ser direto? | respondida | 1 toque direto sem modal de confirmação, com opção de desmarcar (toggle instantâneo). |
