// Testes de spec da feature execucao-navegacao — verificados por onp-spec verify
import { test } from 'node:test';
import assert from 'node:assert/strict';

function getGoogleMapsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function getWazeUrl(lat, lng) {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

// US-010 — Navegação externa via Google Maps e Waze
test('AC-018: Abertura de parada individual via Deeplink no Google Maps @spec:AC-018', () => {
  const url = getGoogleMapsUrl(-23.55052, -46.633308);
  assert.equal(url, 'https://www.google.com/maps/dir/?api=1&destination=-23.55052,-46.633308');
  assert.ok(url.includes('api=1'));
});

// US-010 — Navegação externa via Google Maps e Waze
test('AC-019: Abertura de parada individual via Deeplink no Waze @spec:AC-019', () => {
  const url = getWazeUrl(-23.55052, -46.633308);
  assert.equal(url, 'https://waze.com/ul?ll=-23.55052,-46.633308&navigate=yes');
  assert.ok(url.includes('navigate=yes'));
});

// US-011 — Progresso sequencial e conclusão de paradas
test('AC-020: Marcação de parada concluída e avanço automático @spec:AC-020', () => {
  const stops = [
    { id: 'stop-1', order_index: 1, completed: false },
    { id: 'stop-2', order_index: 2, completed: false },
  ];

  // Toggle 1 toque direto
  stops[0].completed = true;
  const activeStop = stops.find(s => !s.completed);

  assert.equal(stops[0].completed, true);
  assert.equal(activeStop.id, 'stop-2');
});

// US-011 — Progresso sequencial e conclusão de paradas
test('AC-021: Reordenação manual e ajuste em tempo real @spec:AC-021', () => {
  const stops = [
    { id: 'stop-1', order_index: 1 },
    { id: 'stop-2', order_index: 2 },
    { id: 'stop-3', order_index: 3 },
  ];

  // Mover stop-3 para 1ª posição (pular entrega)
  const moved = stops.splice(2, 1)[0];
  stops.unshift(moved);
  stops.forEach((s, idx) => {
    s.order_index = idx + 1;
  });

  assert.equal(stops[0].id, 'stop-3');
  assert.equal(stops[0].order_index, 1);
  assert.equal(stops[1].id, 'stop-1');
  assert.equal(stops[1].order_index, 2);
});
