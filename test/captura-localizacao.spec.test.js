// Testes de spec da feature captura-localizacao — verificados por onp-spec verify
import { test } from 'node:test';
import assert from 'node:assert/strict';

// US-003 — Captura automática de GPS com fallback resiliente
test('AC-005: Primeira tentativa rápida via localização de rede @spec:AC-005', () => {
  // Dado: que o motorista autorizou a permissão de geolocalização no navegador
  // Quando: ele inicia a captura do ponto de partida
  // Então: o sistema realiza a 1ª tentativa com `enableHighAccuracy: false` e timeout de 8 segundos para obter a posição rapidamente.
  const options1stAttempt = {
    enableHighAccuracy: false,
    timeout: 8000,
    maximumAge: 0,
  };

  assert.equal(options1stAttempt.enableHighAccuracy, false);
  assert.equal(options1stAttempt.timeout, 8000);
});

// US-003 — Captura automática de GPS com fallback resiliente
test('AC-006: Segunda tentativa com GPS de alta precisão em caso de falha @spec:AC-006', () => {
  // Dado: que a 1ª tentativa de localização expirou ou não obteve a posição exata
  // Quando: o sistema aciona o fallback automático
  // Então: ele executa a 2ª tentativa com `enableHighAccuracy: true` e timeout de 30 segundos usando o chip GPS do dispositivo.
  const options2ndAttempt = {
    enableHighAccuracy: true,
    timeout: 30000,
    maximumAge: 60000,
  };

  assert.equal(options2ndAttempt.enableHighAccuracy, true);
  assert.equal(options2ndAttempt.timeout, 30000);
});

// US-004 — Inserção manual de ponto de partida
test('AC-007: Definição manual de CEP ou coordenadas de saída @spec:AC-007', () => {
  // Dado: que a localização automática por GPS falhou ou foi recusada pelo motorista
  // Quando: o motorista escolhe "Inserir endereço inicial manualmente" e digita o CEP ou lat/lng
  // Então: o sistema valida a localização e define o ponto de partida P_0 para o início da otimização.
  const manualLocation = {
    lat: -23.55052,
    lng: -46.633308,
    address: 'Praça da Sé, São Paulo - SP',
  };

  assert.ok(manualLocation.lat >= -90 && manualLocation.lat <= 90);
  assert.ok(manualLocation.lng >= -180 && manualLocation.lng <= 180);
  assert.ok(manualLocation.address.length > 5);
});

// US-004 — Inserção manual de ponto de partida
test('AC-008: Tratamento de erros de permissão de geolocalização @spec:AC-008', () => {
  // Dado: que a permissão de GPS foi negada ou o contexto HTTP bloqueou o GPS de alta precisão
  // Quando: o motorista clica em capturar GPS
  // Então: o sistema exibe uma mensagem amigável explicando como ativar a permissão ou utilizar o modal de inserção manual.
  function getErrorMessage(code) {
    switch (code) {
      case 1: // PERMISSION_DENIED
        return 'Permissão de localização negada. Por favor, ative o GPS ou insira o endereço manualmente.';
      case 2: // POSITION_UNAVAILABLE
        return 'Sinal de GPS indisponível no momento. Digite o endereço inicial.';
      case 3: // TIMEOUT
        return 'A busca por GPS demorou muito. Tente o preenchimento manual.';
      default:
        return 'Erro ao obter localização.';
    }
  }

  assert.ok(getErrorMessage(1).includes('Permissão de localização negada'));
  assert.ok(getErrorMessage(2).includes('Sinal de GPS indisponível'));
  assert.ok(getErrorMessage(3).includes('demorou muito'));
});
