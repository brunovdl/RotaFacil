'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PackageScanner } from '@/components/ui/package-scanner';
import { SpreadsheetImporter, ImportedAddress } from '@/components/ui/spreadsheet-importer';
import { AddAddressModal, AddressForm } from '@/components/ui/add-address-modal';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { api } from '@/lib/api';
import { formatCep, onlyNumbers } from '@/lib/utils';
import {
  MapPinIcon,
  BackIcon,
  FlashIcon,
  SpinnerIcon,
  PackageIcon,
  CheckIcon,
  SpreadsheetIcon,
  PlusIcon,
  ChevronRightIcon,
  AddressCardIcon,
  TrashIcon,
} from '@/components/ui/icons';

// ─── tipos ────────────────────────────────────────────────────────────────────

const EMPTY_ADDRESS: AddressForm = {
  cep: '', number: '', complement: '', street: '',
  neighborhood: '', city: '', state: '', lat: 0, lng: 0,
};

const STEPS = ['details', 'stops'] as const;
type Step = 'location' | (typeof STEPS)[number];

const STATE_CENTERS: Record<string, { lat: number; lng: number }> = {
  SP: { lat: -23.5505, lng: -46.6333 },
  RJ: { lat: -22.9068, lng: -43.1729 },
  MG: { lat: -19.9191, lng: -43.9387 },
  RS: { lat: -30.0346, lng: -51.2177 },
  PR: { lat: -25.4284, lng: -49.2733 },
  SC: { lat: -27.5969, lng: -48.5495 },
  BA: { lat: -12.9714, lng: -38.5014 },
  DF: { lat: -15.7975, lng: -47.8919 },
  GO: { lat: -16.6869, lng: -49.2648 },
  PE: { lat: -8.0476, lng: -34.8770 },
  CE: { lat: -3.7172, lng: -38.5434 },
  ES: { lat: -20.3155, lng: -40.3128 },
  AM: { lat: -3.1190, lng: -60.0217 },
  PA: { lat: -1.4558, lng: -48.4902 },
  MA: { lat: -2.5297, lng: -44.3068 },
  RN: { lat: -5.7945, lng: -35.2110 },
  PB: { lat: -7.1195, lng: -34.8450 },
  AL: { lat: -9.6663, lng: -35.7350 },
  PI: { lat: -5.0892, lng: -42.8016 },
  TO: { lat: -10.1845, lng: -48.3338 },
  RO: { lat: -8.7608, lng: -63.8999 },
  AC: { lat: -9.9743, lng: -67.8243 },
  AP: { lat: 0.0349, lng: -51.0694 },
  RR: { lat: 2.8235, lng: -60.6753 },
  MS: { lat: -20.4428, lng: -54.6464 },
  MT: { lat: -15.6010, lng: -56.0974 },
  SE: { lat: -10.9472, lng: -37.0731 },
};

function haversineDist(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeAddress(
  addr: AddressForm,
  contextCity?: string,
  contextState?: string,
): Promise<{ lat: number; lng: number }> {
  const cityToUse = (addr.city || contextCity || '').trim();
  const stateToUse = (addr.state || contextState || '').trim().toUpperCase();

  const cleanCep = onlyNumbers(addr.cep).slice(0, 8);

  // 1. Tenta geocodificação direta por CEP via AwesomeAPI (rápida, precisa para CEPs do Brasil)
  if (cleanCep.length === 8) {
    try {
      const resCep = await fetch(`https://cep.awesomeapi.com.br/json/${cleanCep}`);
      if (resCep.ok) {
        const dataCep = await resCep.json();
        if (dataCep.lat && dataCep.lng) {
          const lat = parseFloat(dataCep.lat);
          const lng = parseFloat(dataCep.lng);
          if (!isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0)) {
            return { lat, lng };
          }
        }
      }
    } catch {}
  }

  // 2. Tentativas hierárquicas no OpenStreetMap (Nominatim) - EXIGE cidade/estado para evitar buscar em São Paulo!
  const queries: string[] = [];
  if (addr.street && (cityToUse || stateToUse)) {
    if (addr.number) {
      queries.push([addr.street, addr.number, addr.neighborhood, cityToUse, stateToUse, 'Brasil'].filter(Boolean).join(', '));
    }
    queries.push([addr.street, cityToUse, stateToUse, 'Brasil'].filter(Boolean).join(', '));
  }
  if (addr.neighborhood && (cityToUse || stateToUse)) {
    queries.push([addr.neighborhood, cityToUse, stateToUse, 'Brasil'].filter(Boolean).join(', '));
  }
  if (cityToUse && stateToUse) {
    queries.push([cityToUse, stateToUse, 'Brasil'].filter(Boolean).join(', '));
  }

  for (const query of queries) {
    if (!query || query === 'Brasil') continue;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'User-Agent': 'RotaFacil/1.0' } },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
          }
        }
      }
    } catch {}
  }

  // 3. Fallback inteligente: centro da cidade do endereço ou centro do contexto
  if (cityToUse) {
    try {
      const cityQuery = `${cityToUse}, ${stateToUse || 'SP'}, Brasil`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&limit=1`,
        { headers: { 'User-Agent': 'RotaFacil/1.0' } },
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      }
    } catch {}
  }

  // 4. Fallback por centro do estado
  if (STATE_CENTERS[stateToUse]) {
    return STATE_CENTERS[stateToUse];
  }

  return { lat: -23.5505, lng: -46.6333 };
}


// ─── componente ───────────────────────────────────────────────────────────────

export default function NewRoutePage() {
  const router = useRouter();

  // navegação por steps
  const [step, setStep] = useState<Step>('location');

  // dados da rota
  const [routeName, setRouteName] = useState('');
  const [notes, setNotes] = useState('');
  const [startLat, setStartLat] = useState<number | null>(null);
  const [startLng, setStartLng] = useState<number | null>(null);
  const [startLabel, setStartLabel] = useState(''); // texto amigável para exibir o ponto de partida

  // paradas
  const [stops, setStops] = useState<AddressForm[]>([]);
  const [currentStop, setCurrentStop] = useState<AddressForm>(EMPTY_ADDRESS);
  const [cepLoading, setCepLoading] = useState(false);
  const [stopAddLoading, setStopAddLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [saving, setSaving] = useState(false);

  // tela de localização
  const [locationMode, setLocationMode] = useState<'options' | 'gps-loading' | 'gps-denied' | 'address'>('options');
  const [locationError, setLocationError] = useState('');

  // formulário de endereço de partida (modo manual)
  const [startAddr, setStartAddr] = useState<AddressForm>(EMPTY_ADDRESS);
  const [startCepLoading, setStartCepLoading] = useState(false);
  const [startCepError, setStartCepError] = useState('');
  const [startAddrLoading, setStartAddrLoading] = useState(false);

  // scanner, planilha e modal de endereço
  const [showScanner, setShowScanner] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Paginação da lista de paradas (10 por página)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleAddSingleStop = async (addr: AddressForm) => {
    const contextCity = startAddr.city || (startLabel.includes('—') ? startLabel.split('—')[1]?.trim() : '');
    const contextState = startAddr.state || 'SP';
    let coords = await geocodeAddress(addr, contextCity, contextState);

    if (startLat !== null && startLng !== null) {
      const distFromStart = haversineDist(startLat, startLng, coords.lat, coords.lng);
      if (distFromStart > 60) {
        coords = { lat: startLat, lng: startLng };
      }
    }

    const newStop = { ...addr, ...coords };
    setStops((prev) => {
      const updated = [...prev, newStop];
      const lastPage = Math.ceil(updated.length / ITEMS_PER_PAGE);
      setCurrentPage(lastPage);
      return updated;
    });
  };

  const handleBatchImportStops = async (importedStops: ImportedAddress[]) => {
    setImportLoading(true);
    try {
      let contextCity = startAddr.city || (startLabel.includes('—') ? startLabel.split('—')[1]?.trim() : '');
      let contextState = startAddr.state || 'SP';

      if (!contextCity) {
        const cities = importedStops.map(s => s.city).filter(Boolean);
        if (cities.length > 0) contextCity = cities[0];
      }
      if (!contextState) {
        const states = importedStops.map(s => s.state).filter(Boolean);
        if (states.length > 0) contextState = states[0];
      }

      const processed: AddressForm[] = [];
      for (const stop of importedStops) {
        const itemCity = stop.city || contextCity;
        const itemState = stop.state || contextState;

        let coords = await geocodeAddress(
          { ...stop, city: itemCity, state: itemState },
          contextCity,
          contextState,
        );

        // Validação contra Outliers (se a parada ficou > 60km do ponto de partida)
        if (startLat !== null && startLng !== null) {
          const distFromStart = haversineDist(startLat, startLng, coords.lat, coords.lng);
          if (distFromStart > 60) {
            const cityCenterCoords = await geocodeAddress(
              { ...stop, street: '', cep: '', city: itemCity, state: itemState },
              itemCity,
              itemState,
            );
            const distCityCenter = haversineDist(startLat, startLng, cityCenterCoords.lat, cityCenterCoords.lng);
            if (distCityCenter <= 60) {
              coords = cityCenterCoords;
            } else {
              coords = { lat: startLat, lng: startLng };
            }
          }
        }

        processed.push({
          ...stop,
          city: itemCity,
          state: itemState,
          ...coords,
        });

        // Delay de 150ms entre geocodificações para evitar estouro de limite de requisições
        await new Promise((resolve) => setTimeout(resolve, 150));
      }

      setStops((prev) => {
        const updated = [...prev, ...processed];
        const lastPage = Math.ceil(updated.length / ITEMS_PER_PAGE);
        setCurrentPage(lastPage);
        return updated;
      });
    } finally {
      setImportLoading(false);
    }
  };

  // ── pede permissão e obtém GPS ─────────────────────────────────────────────
  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationMode('gps-denied');
      setLocationError('Geolocalização não é suportada neste navegador.');
      return;
    }

    setLocationMode('gps-loading');
    setLocationError('');

    const onSuccess = (pos: GeolocationPosition) => {
      setStartLat(pos.coords.latitude);
      setStartLng(pos.coords.longitude);
      setStartLabel('Localização atual (GPS)');
      try {
        localStorage.setItem('location_preference', 'gps');
      } catch {}
      setStep('details');
    };

    const onError = (err: GeolocationPositionError) => {
      if (err.code === err.PERMISSION_DENIED) {
        setLocationMode('gps-denied');
        setLocationError(
          'Você negou a permissão de localização. Para usar o GPS, vá em Configurações do navegador e permita o acesso à localização para este site.'
        );
      } else {
        // TIMEOUT ou POSITION_UNAVAILABLE → tenta novamente com alta precisão
        navigator.geolocation.getCurrentPosition(onSuccess, () => {
          setLocationMode('options');
          setLocationError('Não foi possível obter o GPS. Tente novamente ou informe o endereço de partida.');
        }, { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 });
      }
    };

    // Primeira tentativa: baixa precisão (mais rápida, funciona em redes Wi-Fi)
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    });
  }, []);

  const autoGpsAttempted = useRef(false);

  // ── Auto-obter GPS caso o usuário já tenha autorizado previamente ─────────
  useEffect(() => {
    if (autoGpsAttempted.current) return;
    autoGpsAttempted.current = true;

    const savedPref = typeof window !== 'undefined' ? localStorage.getItem('location_preference') : null;
    if (savedPref === 'gps' && startLat === null) {
      requestGps();
    } else if (typeof window !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted' && startLat === null) {
          requestGps();
        }
      }).catch(() => {});
    }
  }, [requestGps, startLat]);

  // ── lookup CEP do endereço de partida ──────────────────────────────────────
  const lookupStartCep = async (cep: string) => {
    if (cep.length !== 8) return;
    setStartCepLoading(true);
    setStartCepError('');
    try {
      const result = await api.cep.lookup(cep);
      setStartAddr(prev => ({
        ...prev,
        street: result.street,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
      }));
    } catch {
      setStartCepError('CEP não encontrado. Preencha o endereço manualmente.');
    } finally {
      setStartCepLoading(false);
    }
  };

  // ── confirma endereço de partida manual ───────────────────────────────────
  const confirmStartAddress = async () => {
    if (!startAddr.street || !startAddr.city || !startAddr.number) {
      setStartCepError('Preencha rua, número e cidade.');
      return;
    }
    setStartAddrLoading(true);
    try {
      const coords = await geocodeAddress(startAddr);
      setStartLat(coords.lat);
      setStartLng(coords.lng);
      setStartLabel(`${startAddr.street}, ${startAddr.number} — ${startAddr.city}`);
      try {
        localStorage.setItem('location_preference', 'address');
      } catch {}
      setStep('details');
    } finally {
      setStartAddrLoading(false);
    }
  };

  // ── lookup CEP de parada ──────────────────────────────────────────────────
  const lookupStopCep = async (cep?: string) => {
    const clean = cep || onlyNumbers(currentStop.cep);
    if (clean.length !== 8) { setCepError('CEP deve ter 8 dígitos'); return; }
    setCepLoading(true);
    setCepError('');
    try {
      const result = await api.cep.lookup(clean);
      setCurrentStop(prev => ({
        ...prev,
        street: result.street,
        neighborhood: result.neighborhood,
        city: result.city,
        state: result.state,
      }));
    } catch (err: any) {
      setCepError(err.message || 'CEP não encontrado');
    } finally {
      setCepLoading(false);
    }
  };

  // ── adiciona parada ───────────────────────────────────────────────────────
  const addStop = async () => {
    if (!currentStop.cep || !currentStop.number) { setCepError('Preencha CEP e número'); return; }
    if (onlyNumbers(currentStop.cep).length !== 8) { setCepError('CEP deve ter 8 dígitos'); return; }
    setStopAddLoading(true);
    try {
      const coords = await geocodeAddress(currentStop);
      setStops(prev => [...prev, { ...currentStop, ...coords }]);
      setCurrentStop(EMPTY_ADDRESS);
      setCepError('');
    } finally {
      setStopAddLoading(false);
    }
  };

  const handleScanResult = (data: { cep: string; number: string }) => {
    setShowScanner(false);
    if (data.cep) { setCurrentStop(prev => ({ ...prev, cep: data.cep })); setTimeout(() => lookupStopCep(data.cep), 400); }
    if (data.number) setCurrentStop(prev => ({ ...prev, number: data.number }));
  };

  const removeStop = (index: number) => setStops(prev => prev.filter((_, i) => i !== index));

  // ── salvar rota ───────────────────────────────────────────────────────────
  const handleSaveRoute = async () => {
    if (!routeName || stops.length === 0 || startLat === null || startLng === null) return;
    setSaving(true);
    try {
      const result = await api.routes.create({
        name: routeName, notes,
        start_lat: startLat, start_lng: startLng,
        stops: stops.map(s => ({
          cep: onlyNumbers(s.cep), street: s.street, number: s.number,
          complement: s.complement, neighborhood: s.neighborhood,
          city: s.city, state: s.state, lat: s.lat, lng: s.lng,
        })),
      });
      router.push(`/routes/${result.id}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar rota');
    } finally {
      setSaving(false);
    }
  };

  // ════════════════════════════════════════════════════════════════════════════
  //  TELA: LOCALIZAÇÃO DE PARTIDA
  // ════════════════════════════════════════════════════════════════════════════
  if (step === 'location') {
    return (
      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ background: 'var(--surface)' }}
      >
        {/* orb decorativo */}
        <div
          className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />

        <div className="flex-1 flex flex-col px-5 pt-14 pb-8 relative z-10">

          {/* ─── Modo: Opções (tela inicial) ─── */}
          {(locationMode === 'options' || locationMode === 'gps-denied') && (
            <div className="animate-fade-up">

              {/* Ícone */}
              <div className="mb-6">
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center animate-float"
                  style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)' }}
                >
                  <MapPinIcon className="text-brand-400" size={36} />
                </div>
              </div>

              <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Ponto de partida
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                De onde você vai sair para as entregas de hoje?
              </p>

              {/* Erro de permissão negada */}
              {locationMode === 'gps-denied' && locationError && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5' }}
                >
                  <p className="font-medium mb-1">⚠️ {locationError}</p>
                </div>
              )}

              {/* Erro genérico */}
              {locationMode === 'options' && locationError && (
                <div
                  className="mb-5 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#FCA5A5' }}
                >
                  {locationError}
                </div>
              )}

              {/* Botão GPS */}
              <div className="space-y-3">
                <button
                  onClick={requestGps}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left press-effect transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(79,70,229,0.08) 100%)',
                    border: '1px solid rgba(124,58,237,0.35)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}
                  >
                    <MapPinIcon className="text-white" size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Usar minha localização atual
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      O app vai pedir permissão ao GPS do celular
                    </p>
                  </div>
                  <ChevronRightIcon size={16} className="text-muted" />
                </button>

                {/* Botão endereço manual */}
                <button
                  onClick={() => setLocationMode('address')}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-left press-effect transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <AddressCardIcon size={22} className="text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Digitar endereço de partida
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Informe o CEP ou endereço completo
                    </p>
                  </div>
                  <ChevronRightIcon size={16} className="text-muted" />
                </button>
              </div>

              <Link href="/dashboard" className="block mt-8 text-center text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
                ← Cancelar
              </Link>
            </div>
          )}

          {/* ─── Modo: GPS carregando ─── */}
          {locationMode === 'gps-loading' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <LoadingOverlay
                title="Obtendo Sinal de GPS"
                message="Aguarde a permissão e conexão com o GPS do celular..."
                subtext="Usando alta precisão de rede e GPS físico"
              />
              <button
                className="relative z-50 mt-4 text-xs font-semibold underline press-effect text-brand-300"
                onClick={() => { setLocationMode('options'); setLocationError(''); }}
              >
                Cancelar e digitar endereço
              </button>
            </div>
          )}

          {/* ─── Modo: Endereço manual ─── */}
          {locationMode === 'address' && (
            <div className="animate-fade-up space-y-5">
              {/* Voltar */}
              <button
                onClick={() => { setLocationMode('options'); setStartCepError(''); }}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl press-effect text-sm font-medium mb-1"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
              >
                <BackIcon size={16} /> Voltar
              </button>

              <div>
                <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Endereço de partida
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  De onde você vai sair? Pode pesquisar pelo CEP.
                </p>
              </div>

              {/* CEP com busca automática */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="CEP"
                    placeholder="00000-000"
                    value={formatCep(startAddr.cep)}
                    onChange={e => {
                      const clean = onlyNumbers(e.target.value).slice(0, 8);
                      setStartAddr(prev => ({ ...prev, cep: clean }));
                      setStartCepError('');
                      if (clean.length === 8) setTimeout(() => lookupStartCep(clean), 300);
                    }}
                    maxLength={9}
                    error={startCepError}
                  />
                </div>
                {startCepLoading && (
                  <div className="pt-8 flex items-center">
                    <SpinnerIcon size={18} className="text-brand-500" />
                  </div>
                )}
              </div>

              <Input
                label="Rua / Logradouro"
                placeholder="Nome da rua"
                value={startAddr.street}
                onChange={e => setStartAddr(prev => ({ ...prev, street: e.target.value }))}
              />

              <div className="flex gap-2">
                <div className="w-24">
                  <Input
                    label="Número"
                    placeholder="123"
                    value={startAddr.number}
                    onChange={e => setStartAddr(prev => ({ ...prev, number: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    label="Bairro"
                    placeholder="Bairro"
                    value={startAddr.neighborhood}
                    onChange={e => setStartAddr(prev => ({ ...prev, neighborhood: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    label="Cidade"
                    placeholder="Cidade"
                    value={startAddr.city}
                    onChange={e => setStartAddr(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="w-20">
                  <Input
                    label="UF"
                    placeholder="SP"
                    maxLength={2}
                    value={startAddr.state}
                    onChange={e => setStartAddr(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={confirmStartAddress}
                loading={startAddrLoading}
                disabled={!startAddr.street || !startAddr.city || !startAddr.number}
              >
                <CheckIcon className="mr-2" size={18} />
                Confirmar endereço de partida
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  //  STEPS: DETALHES / PARADAS / REVISÃO
  // ════════════════════════════════════════════════════════════════════════════
  const stepIndex = STEPS.indexOf(step as any);

  return (
    <div className="px-4 pt-6 pb-28" style={{ background: 'var(--surface)', minHeight: '100vh' }}>

      {/* Cabeçalho */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => step === 'details' ? router.push('/dashboard') : setStep(STEPS[stepIndex - 1])}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl press-effect text-sm font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}
        >
          <BackIcon size={16} /> Voltar
        </button>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
          Passo {stepIndex + 1} de {STEPS.length}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="flex gap-1.5 mb-7">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{
              background: i <= stepIndex
                ? 'linear-gradient(90deg, #7C3AED, #4F46E5)'
                : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>

      {/* ── STEP: DETALHES ── */}
      {step === 'details' && (
        <div className="animate-fade-up space-y-5">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Detalhes da rota
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Dê um nome para identificar facilmente
            </p>
          </div>

          {/* Badge do ponto de partida confirmado */}
          {startLabel && (
            <div
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(16,217,160,0.08)', border: '1px solid rgba(16,217,160,0.2)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MapPinIcon className="text-neon-green flex-shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: '#10D9A0' }}>Partida confirmada</p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{startLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('location');
                  setLocationMode('options');
                }}
                className="text-xs font-medium underline text-brand-300 press-effect flex-shrink-0 ml-2"
              >
                Alterar
              </button>
            </div>
          )}

          <Input
            label="Nome da rota"
            placeholder="Ex: Entregas Centro — Seg"
            value={routeName}
            onChange={e => setRouteName(e.target.value)}
          />
          <Input
            label="Observação (opcional)"
            placeholder="Ex: Evitar Av. Paulista no horário de pico"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <Button size="lg" className="w-full" onClick={() => setStep('stops')} disabled={!routeName}>
            Próximo: adicionar paradas →
          </Button>
        </div>
      )}

      {/* ── STEP: PARADAS ── */}
      {step === 'stops' && (
        <div className="animate-fade-up space-y-4">
          {/* Header e Ações do Topo */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Paradas</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {stops.length === 0 ? 'Adicione ao menos 2 paradas' : `${stops.length} paradas no total`}
              </p>
            </div>
            {stops.length > 0 && (
              <div
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}
              >
                {stops.length} paradas
              </div>
            )}
          </div>

          {/* Barra de Ações Fixa no Topo */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowImporter(true)}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl font-semibold text-xs press-effect hover-lift"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(79,70,229,0.1) 100%)',
                border: '1px solid rgba(124,58,237,0.35)',
                color: '#A78BFA',
              }}
            >
              <SpreadsheetIcon size={18} />
              Importar Planilha
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 p-3 rounded-2xl font-semibold text-xs press-effect hover-lift"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                color: '#FFFFFF',
                boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
              }}
            >
              <PlusIcon size={18} />
              Adicionar Parada
            </button>
          </div>

          {/* Lista de paradas (Paginada 10 a 10) */}
          {stops.length === 0 ? (
            <div
              className="rounded-2xl p-6 text-center space-y-3 cursor-pointer press-effect"
              onClick={() => setShowAddModal(true)}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px border-dashed rgba(255,255,255,0.08)' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto bg-brand-500/15 text-brand-300 text-xl">
                📍
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Nenhuma parada adicionada ainda
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Clique em <strong>+ Adicionar Parada</strong> ou <strong>Importar Planilha</strong> no topo
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {(() => {
                const totalPages = Math.max(1, Math.ceil(stops.length / ITEMS_PER_PAGE));
                const pageIndex = Math.min(currentPage, totalPages);
                const startIndex = (pageIndex - 1) * ITEMS_PER_PAGE;
                const pageStops = stops.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                return pageStops.map((stop, i) => {
                  const globalIndex = startIndex + i;
                  return (
                    <div
                      key={globalIndex}
                      className="rounded-xl p-3 flex items-start gap-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                        style={{ background: 'rgba(124,58,237,0.2)', color: '#A78BFA' }}
                      >
                        {globalIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {stop.street}, {stop.number}
                          {stop.complement && <span style={{ color: 'var(--text-muted)' }}> — {stop.complement}</span>}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {stop.neighborhood}, {stop.city} — {stop.state} (CEP: {formatCep(stop.cep)})
                        </p>
                      </div>
                      <button
                        onClick={() => removeStop(globalIndex)}
                        className="p-1.5 rounded-lg flex-shrink-0 press-effect"
                        style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}
                        title="Remover parada"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* Paginação (exibida quando há paradas) */}
          {stops.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold press-effect disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
              >
                ← Anterior
              </button>

              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                Página {currentPage} de {Math.max(1, Math.ceil(stops.length / ITEMS_PER_PAGE))}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(Math.ceil(stops.length / ITEMS_PER_PAGE), p + 1))
                }
                disabled={currentPage >= Math.ceil(stops.length / ITEMS_PER_PAGE)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold press-effect disabled:opacity-40"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}
              >
                Próxima →
              </button>
            </div>
          )}

          {stops.length >= 2 && (
            <div className="space-y-3 pt-2">
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <FlashIcon className="text-brand-400" size={16} />
                  <span className="text-sm font-semibold" style={{ color: '#A78BFA' }}>
                    Otimização automática (Nearest Neighbor)
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  A sequência das {stops.length} paradas será calculada para minimizar a distância total percorrida.
                </p>
              </div>

              <Button size="lg" className="w-full" onClick={handleSaveRoute} loading={saving}>
                <FlashIcon className="mr-2" size={18} />
                Gerar rota otimizada ({stops.length} paradas)
              </Button>
            </div>
          )}
        </div>
      )}

      {showScanner && (
        <PackageScanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />
      )}

      {showAddModal && (
        <AddAddressModal
          onAddStop={handleAddSingleStop}
          onClose={() => setShowAddModal(false)}
          addedCount={stops.length}
        />
      )}

      {showImporter && (
        <SpreadsheetImporter
          onImportStops={handleBatchImportStops}
          onClose={() => setShowImporter(false)}
        />
      )}

      {importLoading && (
        <LoadingOverlay
          title="Processando Entregas Importadas"
          message="Geocodificando endereços e obtendo coordenadas no mapa..."
        />
      )}

      {saving && (
        <LoadingOverlay
          title="Gerando Rota Otimizada"
          message="Calculando menor distância pelo algoritmo Nearest Neighbor..."
          subtext="Organizando sequência de paradas para economizar combustível"
        />
      )}
    </div>
  );
}
