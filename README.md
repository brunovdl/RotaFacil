# RotaFácil 🚚💨 — Micro-SaaS de Roteirização Inteligente

**RotaFácil** é um Micro-SaaS para organização e otimização inteligente de entregas direcionado a **motoristas autônomos, entregadores de e-commerce e motoboys**. A aplicação permite cadastrar múltiplos endereços ou importar listas completas de entregas via planilha, gerando automaticamente a **melhor ordem de visita para minimizar a distância percorrida e economizar combustível**, utilizando o ponto de partida do motorista (GPS ou localização manual).

---

## 🎯 Proposta de Valor

* ⛽ **Economia de Combustível**: Redução de quilômetros rodados através de algoritmos de otimização de rotas.
* ⚡ **Organização Rápida**: Preenchimento automático de endereços via **CEP (ViaCEP / AwesomeAPI)** e leitura de etiquetas de pacotes por câmera.
* 📊 **Importador de Planilhas em Lote**: Suporte a planilhas Excel (`.xlsx`, `.xls`) e `.csv` com mapeamento dinâmico de colunas e prevenção inteligente contra erros de geocodificação.
* 📲 **Navegação com 1 Toque**: Integração nativa por deeplink com **Google Maps** e **Waze** para navegação parada a parada.
* 📱 **PWA & Dark Glassmorphism**: Interface moderna em tema escuro com respostas táticas e alta legibilidade em dispositivos móveis (360px+).

---

## 🚀 Funcionalidades Principais

### 📍 1. Definição do Ponto de Partida
* Captura de localização em tempo real via **GPS do celular** (com fallback de baixa e alta precisão).
* Opção de inserir manualmente o CEP/endereço inicial de saída.

### 📦 2. Gestão e Importação de Paradas
* **Cadastro Manual Assistido**: Preenchimento de rua, bairro, cidade e estado ao digitar o CEP.
* **Leitor de Pacotes (OCR/Scanner)**: Captura de CEP e número direto da câmera do celular.
* **Importação Lote de Planilhas**: Leitura flexível de planilhas de entregas com paginação de 10 em 10 itens para fácil gestão em telas menores.

### 🧠 3. Algoritmo de Otimização (Nearest Neighbor + Haversine)
* Ordenação sequencial automática que calcula a menor distância acumulada a partir do ponto inicial.
* **Validação Anti-Outliers (> 60 km)**: Detecção e ajuste automático de coordenadas para garantir que todas as entregas permaneçam na mesma cidade da rota.
* Estimativa imediata de distância total (em km) e tempo de viagem.

### 🗺️ 4. Execução de Rota & Deeplinks Externa
* Navegação sequencial com marcação de parada concluída.
* Abertura direta do próximo destino no **Google Maps** ou **Waze**.

### 📊 5. Histórico & Relatórios Operacionais
* Consulta a rotas anteriores com opção de duplicar ou exportar.
* Dashboard com indicadores de km percorridos, entregas realizadas e estimativa de combustível economizado.

---

## 🛠️ Arquitetura e Tecnologias

### **Frontend**
* **Framework**: Next.js 15 (App Router + React)
* **Linguagem**: TypeScript (Strict Mode)
* **Estilização**: Tailwind CSS + Custom Dark Glassmorphism Design System
* **Recursos**: Progressive Web App (PWA), Lucide/Custom Icons, XLSX Parser

### **Backend**
* **Framework**: NestJS (v10+)
* **Linguagem**: TypeScript
* **Banco de Dados & Autenticação**: Supabase (PostgreSQL + JWT Auth)
* **Arquitetura**: Controller ➔ Service ➔ DatabaseProvider (Multi-tenant por `user_id`)

### **Serviços de Mapas & Geocodificação**
* **OpenStreetMap & Nominatim**: Geocodificação hierárquica e busca de coordenadas.
* **AwesomeAPI & ViaCEP**: Consulta resiliente de CEPs do Brasil e dados geográficos.

---

## 💼 Modelo de Negócio

* **Formato**: SaaS (Software como Serviço) individual.
* **Plano**: Assinatura recorrente mensal com **7 dias de teste grátis (trial)**.
* **Escopo da Conta**: Conta individual por motorista.
