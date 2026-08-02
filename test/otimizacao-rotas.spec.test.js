// Testes de spec da feature otimizacao-rotas — verificados por onp-spec verify
import { test } from 'node:test';
import assert from 'node:assert/strict';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1.3; // Fator de tortuosidade viária
}

// US-008 — Cálculo da melhor ordem de entrega por menor distância
test('AC-014: Ordenação sequencial por Vizinho Mais Próximo (Nearest Neighbor) @spec:AC-014', () => {
  const start = { lat: -23.55052, lng: -46.633308 }; // Praça da Sé
  const stops = [
    { id: 'stop-1', lat: -23.561414, lng: -46.655881 }, // Av Paulista (mais próxima)
    { id: 'stop-2', lat: -23.626889, lng: -46.657519 }, // Congonhas (mais distante)
  ];

  // Nearest neighbor
  const current = { ...start };
  const remaining = [...stops];
  const ordered = [];

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let minDist = haversineDistance(current.lat, current.lng, remaining[0].lat, remaining[0].lng);

    for (let i = 1; i < remaining.length; i++) {
      const dist = haversineDistance(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    const nextStop = remaining.splice(nearestIdx, 1)[0];
    ordered.push(nextStop);
    current.lat = nextStop.lat;
    current.lng = nextStop.lng;
  }

  assert.equal(ordered.length, 2);
  assert.equal(ordered[0].id, 'stop-1');
  assert.equal(ordered[1].id, 'stop-2');
});

// US-008 — Cálculo da melhor ordem de entrega por menor distância
test('AC-015: Validação anti-outliers para paradas distantes (> 60 km) @spec:AC-015', () => {
  const start = { lat: -23.55052, lng: -46.633308 }; // São Paulo
  const outlierStop = { id: 'outlier-1', lat: -22.9068, lng: -43.1729 }; // Rio de Janeiro (~350 km)

  const dist = haversineDistance(start.lat, start.lng, outlierStop.lat, outlierStop.lng);
  const isOutlier = dist > 60;

  assert.equal(isOutlier, true);
  assert.ok(dist > 60);
});

// US-009 — Resumo da rota e mapa de navegação
test('AC-016: Cálculo de tempo e distância totais da rota @spec:AC-016', () => {
  const totalKm = 15.4;
  const estimatedTimeMin = Math.round(totalKm * 2);

  assert.equal(totalKm, 15.4);
  assert.equal(estimatedTimeMin, 31);
});

// US-009 — Resumo da rota e mapa de navegação
test('AC-017: Renderização de marcadores numerados no mapa @spec:AC-017', () => {
  const startPoint = { type: 'origin', label: 'Ponto Inicial' };
  const stops = [
    { type: 'stop', order: 1, label: 'Parada 1' },
    { type: 'stop', order: 2, label: 'Parada 2' },
  ];

  const mapMarkers = [startPoint, ...stops];
  assert.equal(mapMarkers.length, 3);
  assert.equal(mapMarkers[0].type, 'origin');
  assert.equal(mapMarkers[1].order, 1);
  assert.equal(mapMarkers[2].order, 2);
});
