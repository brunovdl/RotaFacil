# Tasks: Gestao paradas cep

> feature: gestao-paradas-cep

## T-007 — Implementar serviço de busca de CEP com fallback e geocodificação no backend [pendente]

- Refs: US-005, AC-009, AC-010
- Arquivos: backend/src/cep/cep.service.ts, backend/src/cep/cep.controller.ts, backend/src/cep/cep.module.ts, backend/src/geocoding/geocoding.service.ts, backend/src/geocoding/geocoding.controller.ts, backend/src/geocoding/geocoding.module.ts, backend/src/database/database.service.ts, backend/src/database/database.module.ts, backend/src/app.module.ts, backend/src/main.ts
- Esforço: alto

## T-008 — Criar componente de formulário manual com auto-preenchimento por CEP [pendente]

- Refs: US-005, AC-009
- Arquivos: frontend/components/stops/StopForm.tsx, frontend/components/ui/input.tsx
- Esforço: medio

## T-009 — Implementar parser de planilhas XLSX/CSV com paginação mobile [pendente]

- Refs: US-006, AC-011, AC-012
- Arquivos: frontend/components/stops/SpreadsheetImporter.tsx, frontend/lib/utils/excelParser.ts
- Esforço: alto

## T-010 — Implementar scanner de etiquetas com Tesseract.js no frontend [pendente]

- Refs: US-007, AC-013
- Arquivos: frontend/components/stops/PackageScannerModal.tsx
- Esforço: alto
