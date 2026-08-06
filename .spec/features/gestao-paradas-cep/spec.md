# Spec: Gestao paradas cep

> feature: gestao-paradas-cep
> status: rascunho

## Contexto

Cadastro e gestão de paradas de entrega via digitação manual com autocomplete por CEP (ViaCEP + Correios), leitor de etiquetas via câmera (OCR) e importação em lote de planilhas Excel/CSV com paginação de 10 em 10 itens para telas mobile.

## Histórias

### US-005 — Preenchimento automático de endereço por CEP

Como entregador, quero digitar apenas o CEP e o número do imóvel, para cadastrar rapidamente cada parada sem precisar preencher rua, bairro, cidade e estado manualmente.

#### AC-009 — Consulta ao ViaCEP com fallback resiliente aos Correios

- **Dado** que o entregador digita um CEP válido com 8 dígitos
- **Quando** o sistema realiza a busca
- **Então** ele consulta o serviço ViaCEP e, em caso de indisponibilidade, aciona o fallback para a API de Correios/AwesomeAPI para preencher automaticamente os campos de logradouro, bairro, cidade e UF.

#### AC-010 — Geocodificação de endereço para coordenadas (lat/lng)

- **Dado** que um endereço com rua, número e cidade foi confirmado
- **Quando** o backend processa o cadastro da parada
- **Então** o sistema faz a geocodificação via Nominatim (OpenStreetMap), aplicando delay de rate-limiting (200ms) e salvando a latitude e longitude correspondentes.

### US-006 — Importação de entregas via planilha em lote

Como entregador de e-commerce com dezenas de pacotes, quero enviar uma planilha XLSX/CSV com meus endereços do dia, para carregar todas as entregas de uma só vez na rota.

#### AC-011 — Mapeamento flexível de colunas da planilha

- **Dado** que o entregador faz o upload de uma planilha `.xlsx` ou `.csv`
- **Quando** a planilha é processada no frontend
- **Então** o sistema identifica as colunas de CEP, Rua, Número e Bairro mesmo com nomes variados e valida as linhas.

#### AC-012 — Paginação de 10 em 10 itens na importação mobile

- **Dado** que a planilha importada contém mais de 10 entregas
- **Quando** a lista é exibida na tela do celular
- **Então** o sistema apresenta os dados paginados de 10 em 10 itens, garantindo fácil navegação e revisão em telas menores (360px+).

### US-007 — Leitor de etiquetas de pacotes via câmera (OCR)

Como entregador com pacote em mãos, quero apontar a câmera do celular para a etiqueta do pacote, para extrair o CEP e o número automaticamente.

#### AC-013 — Leitura de CEP por câmera com OCR

- **Dado** que o entregador ativa o leitor de etiquetas por câmera
- **Quando** a câmera enquadra o CEP no pacote
- **Então** o Tesseract.js reconhece o texto, extrai os 8 dígitos do CEP e preenche os dados da parada automaticamente.

## Fora de escopo

- Reconhecimento de códigos de barras 1D de padrão proprietário sem CEP legível.

## Suposições

| ID | Suposição | Status | Resolução |
|---|---|---|---|
| ASM-003 | Respostas de geocodificação devem ter cache em memória no backend NestJS para evitar estourar o limite de requisições do Nominatim. | confirmada | Cache de 24h em memória implementado em GeocodingService. |

## Perguntas em aberto

| ID | Pergunta | Status | Resposta |
|---|---|---|---|
| Q-003 | Qual deve ser o limite máximo de paradas permitidas em uma única rota no plano grátis? | respondida | Sem limite de paradas durante os 7 dias de trial para experiência completa. |
