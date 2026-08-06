# RotaFácil 🚚💨 — Micro-SaaS de Roteirização Inteligente

**RotaFácil** é um Micro-SaaS para organização e otimização inteligente de entregas direcionado a **motoristas autônomos, entregadores de e-commerce e motoboys**. A aplicação permite cadastrar múltiplos endereços ou importar listas completas de entregas via planilha, gerando automaticamente a **melhor ordem de visita para minimizar a distância percorrida e economizar combustível**, utilizando o ponto de partida do motorista (GPS ou localização manual).

---

## 🎯 Proposta de Valor

* ⛽ **Economia de Combustível**: Redução de quilômetros rodados através de algoritmos de otimização de rotas.
* ⚡ **Organização Rápida**: Preenchimento automático de endereços via **CEP (ViaCEP / AwesomeAPI)** e leitura de etiquetas de pacotes por câmera (OCR Tesseract.js).
* 📊 **Importador de Planilhas em Lote**: Suporte a planilhas Excel (`.xlsx`, `.xls`) e `.csv` com mapeamento dinâmico de colunas e paginação mobile de 10 em 10 itens.
* 🗺️ **Mapa Interativo Dark Glassmorphism**: Renderização em tempo real da rota com **Leaflet (CartoDB Dark Matter)**, polilinhas animadas e marcadores numerados.
* 📲 **Navegação com 1 Toque**: Integração nativa por deeplink com **Google Maps** e **Waze** para navegação parada a parada.
* 📡 **Resiliência Offline & PWA**: Monitoramento em tempo real do status de conexão com banner de aviso e suporte a PWA instalável no celular.
* 🛡️ **Segurança & Rate Limiting**: Proteção de endpoints NestJS com `@nestjs/throttler`, filtro centralizado de exceções HTTP e verificação HMAC `x-signature` para Mercado Pago.

---

## 🚀 Funcionalidades Principais

### 📍 1. Definição do Ponto de Partida
* Captura de localização em tempo real via **GPS do celular** (com estratégia de 2 tentativas: rede rápida + chip GPS).
* Inserção manual assistida por CEP ou coordenadas de saída.

### 📦 2. Gestão e Importação de Paradas
* **Cadastro Manual Assistido**: Autocomplete de rua, bairro, cidade e estado ao digitar o CEP.
* **Leitor de Pacotes (OCR/Scanner)**: Captura instantânea de CEP e número direto da câmera do celular.
* **Importação Lote de Planilhas**: Leitura flexível com paginação mobile de 10 em 10 itens para fácil revisão em telas menores (360px+).

### 🧠 3. Algoritmo de Otimização (Nearest Neighbor + Haversine)
* Ordenação sequencial automática por menor distância acumulada a partir do ponto inicial ($< 10\text{ ms}$ para 100 paradas).
* **Validação Anti-Outliers (> 60 km)**: Detecção e sinalização visual para paradas distantes.
* Estimativa imediata de distância total (km) e tempo de viagem.

### 🗺️ 4. Execução de Rota, Mapa & Deeplinks
* Visualização da rota em mapa interativo escuro com Leaflet.
* Navegação sequencial com marcação de entrega concluída em 1 toque.
* Abertura direta do próximo destino no **Google Maps** ou **Waze**.

### 📊 5. Histórico, Relatórios & Pagamento
* Consulta a rotas anteriores com opção de duplicar ou exportar em CSV.
* Dashboard com indicadores de km percorridos, entregas realizadas e estimativa de combustível economizado (média 10 km/L).
* Checkout transparente e recorrente via **Mercado Pago** (PIX QR Code Copia e Cola + Cartão de Crédito).

---

## 🛠️ Arquitetura e Tecnologias

### **Frontend**
* **Framework**: Next.js 15 (App Router + React 19)
* **Linguagem**: TypeScript (Strict Mode)
* **Estilização**: Tailwind CSS + Custom Dark Glassmorphism Design System (`globals.css`)
* **Recursos**: Progressive Web App (PWA), Leaflet Map (CartoDB Dark Matter), Lucide/Custom Icons, Tesseract.js OCR, XLSX Parser

### **Backend**
* **Framework**: NestJS (v10+)
* **Linguagem**: TypeScript
* **Banco de Dados & Autenticação**: Supabase (PostgreSQL + JWT Auth)
* **Segurança & Resiliência**: `@nestjs/throttler` (Rate Limiting), `HttpExceptionFilter` (Filtro Global HTTP), Isolamento Multi-tenant por `user_id`
* **Arquitetura**: Controller ➔ Service ➔ DatabaseProvider

### **Serviços de Mapas & Geocodificação**
* **OpenStreetMap & Nominatim**: Geocodificação com cache de 24h em memória no NestJS.
* **AwesomeAPI & ViaCEP**: Consulta de CEPs do Brasil e dados geográficos com fallback.

---

## 📜 Metodologia Spec-Driven (`onp-spec-driven`)

O projeto utiliza desenvolvimento ancorado em especificações (`onp-spec-driven`), onde cada critério de aceite possui um teste correspondente anotado `@spec:AC-xxx` e auditado mecanicamente:

```text
resumo: 7 feature(s) · 16 história(s) de usuário · 30 critério(s) de aceite
        30/30 com teste anotado · 30/30 provados (PASS) · 0 avisos
✔ auditoria mecânica limpa (0 erros)
```

---

## 💼 Modelo de Negócio

* **Formato**: SaaS (Software como Serviço) individual.
* **Plano**: Assinatura recorrente mensal com **7 dias de teste grátis (trial)**.
* **Escopo da Conta**: Conta individual por motorista.

