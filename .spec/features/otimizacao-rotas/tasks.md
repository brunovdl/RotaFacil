# Tasks: Otimizacao rotas

> feature: otimizacao-rotas

## T-011 — Implementar algoritmo Nearest Neighbor + Haversine e filtro anti-outliers no backend [pendente]

- Refs: US-008, AC-014, AC-015
- Arquivos: backend/src/optimization/optimization.service.ts, backend/src/optimization/optimization.module.ts, backend/src/routes/dto/create-route.dto.ts
- Esforço: alto

## T-012 — Implementar cálculo de estimativa de km e tempo no serviço de rotas [pendente]

- Refs: US-009, AC-016
- Arquivos: backend/src/routes/routes.service.ts, backend/src/routes/routes.controller.ts, backend/src/routes/routes.module.ts, backend/src/vehicles/vehicles.service.ts, backend/src/vehicles/vehicles.controller.ts, backend/src/vehicles/vehicles.module.ts, backend/src/vehicles/dto/update-vehicle.dto.ts
- Esforço: medio

## T-013 — Criar mapa interativo com marcadores numerados e linha de rota no frontend [pendente]

- Refs: US-009, AC-017
- Arquivos: frontend/components/map/RouteMap.tsx, frontend/app/(dashboard)/routes/new/page.tsx, frontend/app/(dashboard)/routes/[id]/page.tsx, frontend/app/(dashboard)/routes/[id]/loading.tsx
- Esforço: alto
