# Spec: Captura localizacao

> feature: captura-localizacao
> status: rascunho

## Contexto

Obtenção e validação do ponto de partida da rota utilizando localização em tempo real (GPS do celular com estratégia de 2 tentativas) ou inserção manual de coordenadas/CEP pelo motorista.

## Histórias

### US-003 — Captura automática de GPS com fallback resiliente

Como motorista em trânsito, quero que o aplicativo obtenha minha localização atual automaticamente via GPS, para que eu não precise digitar meu endereço inicial a cada nova rota.

#### AC-005 — Primeira tentativa rápida via localização de rede

- **Dado** que o motorista autorizou a permissão de geolocalização no navegador
- **Quando** ele inicia a captura do ponto de partida
- **Então** o sistema realiza a 1ª tentativa com `enableHighAccuracy: false` e timeout de 8 segundos para obter a posição rapidamente.

#### AC-006 — Segunda tentativa com GPS de alta precisão em caso de falha

- **Dado** que a 1ª tentativa de localização expirou ou não obteve a posição exata
- **Quando** o sistema aciona o fallback automático
- **Então** ele executa a 2ª tentativa com `enableHighAccuracy: true` e timeout de 30 segundos usando o chip GPS do dispositivo.

### US-004 — Inserção manual de ponto de partida

Como motorista em local com sinal de GPS fraco ou indoor, quero inserir manualmente meu endereço ou coordenadas iniciais, para que eu possa gerar rotas mesmo sem sinal de satélite.

#### AC-007 — Definição manual de CEP ou coordenadas de saída

- **Dado** que a localização automática por GPS falhou ou foi recusada pelo motorista
- **Quando** o motorista escolhe "Inserir endereço inicial manualmente" e digita o CEP ou lat/lng
- **Então** o sistema valida a localização e define o ponto de partida $P_0$ para o início da otimização.

#### AC-008 — Tratamento de erros de permissão de geolocalização

- **Dado** que a permissão de GPS foi negada ou o contexto HTTP bloqueou o GPS de alta precisão
- **Quando** o motorista clica em capturar GPS
- **Então** o sistema exibe uma mensagem amigável explicando como ativar a permissão ou utilizar o modal de inserção manual.

## Fora de escopo

- Rastreamento contínuo em tempo real (tracking em background enquanto o app está fechado).

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-002 | Ambientes de produção exigem HTTPS para liberar o uso da Geolocation API no navegador Chrome mobile. | confirmada | HTTPS configurado em produção. |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-002 | Devemos salvar o último ponto de partida utilizado para sugerir como padrão na próxima rota? | respondida | Não, sempre forçar a captura em tempo real via GPS ou digitação manual a cada nova rota. |
