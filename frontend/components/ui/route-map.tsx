'use client';

import { useEffect, useRef, useState } from 'react';

interface RouteStopMapData {
  id: string;
  order_index?: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  completed?: boolean;
}

interface RouteMapProps {
  startLat: number;
  startLng: number;
  stops: RouteStopMapData[];
  completedStopIds?: Set<string>;
  onSelectStop?: (stop: RouteStopMapData) => void;
  selectedStopId?: string | null;
}

export function RouteMap({
  startLat,
  startLng,
  stops,
  completedStopIds = new Set(),
  onSelectStop,
  selectedStopId,
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Carrega CSS do Leaflet dinamicamente se necessário
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else if ((window as any).L) {
      setMapLoaded(true);
    }
  }, []);

  // Inicializa e atualiza o mapa Leaflet
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    leafletInstance.current = map;

    // Dark Map Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const bounds: [number, number][] = [];

    // Marker Ponto Inicial
    if (startLat && startLng) {
      bounds.push([startLat, startLng]);
      const startIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            width: 32px; height: 32px;
            background: linear-gradient(135deg, #10D9A0, #059669);
            border-radius: 50%;
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 16px rgba(16, 217, 160, 0.6);
            display: flex; align-items: center; justify-content: center;
            color: #FFFFFF; font-weight: bold; font-size: 11px;
          ">
            📍
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([startLat, startLng], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<b>Ponto de Partida</b><br/>GPS Inicial`);
    }

    // Coordinates path line
    const pathCoords: [number, number][] = [];
    if (startLat && startLng) pathCoords.push([startLat, startLng]);

    stops.forEach((stop, idx) => {
      if (!stop.lat || !stop.lng) return;
      bounds.push([stop.lat, stop.lng]);
      pathCoords.push([stop.lat, stop.lng]);

      const isCompleted = stop.completed || completedStopIds.has(stop.id);
      const isSelected = selectedStopId === stop.id;

      const bgColor = isCompleted
        ? 'linear-gradient(135deg, rgba(16,217,160,0.8), rgba(5,150,105,0.9))'
        : isSelected
        ? 'linear-gradient(135deg, #F59E0B, #D97706)'
        : 'linear-gradient(135deg, #7C3AED, #4F46E5)';

      const borderColor = isCompleted ? '#10D9A0' : isSelected ? '#FCD34D' : '#A78BFA';
      const shadowColor = isCompleted
        ? 'rgba(16,217,160,0.4)'
        : isSelected
        ? 'rgba(245,158,11,0.5)'
        : 'rgba(124,58,237,0.5)';

      const stopIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            width: ${isSelected ? 34 : 28}px;
            height: ${isSelected ? 34 : 28}px;
            background: ${bgColor};
            border: 2px solid ${borderColor};
            border-radius: 50%;
            box-shadow: 0 0 12px ${shadowColor};
            display: flex; align-items: center; justify-content: center;
            color: #FFFFFF; font-weight: 800; font-size: ${isSelected ? 13 : 11}px;
            transition: all 0.2s ease;
          ">
            ${isCompleted ? '✓' : idx + 1}
          </div>
        `,
        iconSize: [isSelected ? 34 : 28, isSelected ? 34 : 28],
        iconAnchor: [isSelected ? 17 : 14, isSelected ? 17 : 14],
      });

      const marker = L.marker([stop.lat, stop.lng], { icon: stopIcon }).addTo(map);

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #1E1E38;">
          <b style="color: #7C3AED;">Parada ${idx + 1}</b><br/>
          <b>${stop.street}, ${stop.number}</b><br/>
          <span style="color: #666;">${stop.neighborhood}, ${stop.city}</span><br/>
          <span style="font-weight: 600; color: ${isCompleted ? '#10D9A0' : '#4F46E5'};">
            ${isCompleted ? '✓ Concluída' : 'Pendente'}
          </span>
        </div>
      `);

      if (onSelectStop) {
        marker.on('click', () => onSelectStop(stop));
      }
    });

    // Draw route path line
    if (pathCoords.length > 1) {
      L.polyline(pathCoords, {
        color: '#7C3AED',
        weight: 4,
        opacity: 0.8,
        dashArray: '8, 6',
      }).addTo(map);

      // Glow overlay line
      L.polyline(pathCoords, {
        color: '#A78BFA',
        weight: 2,
        opacity: 0.9,
      }).addTo(map);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [35, 35] });
    } else if (startLat && startLng) {
      map.setView([startLat, startLng], 14);
    }
  }, [mapLoaded, startLat, startLng, stops, completedStopIds, selectedStopId]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-lg border border-white/10"
      style={{ height: '240px', background: 'var(--surface-1)' }}
    >
      <div ref={mapRef} className="w-full h-full z-10" />

      {/* Fallback de Carregamento */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-1/90 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2 text-xs font-medium text-brand-300">
            <span className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            Carregando mapa da rota...
          </div>
        </div>
      )}

      {/* Badge de Legenda do Mapa */}
      <div
        className="absolute bottom-2 left-2 z-20 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-medium flex items-center gap-3"
        style={{ background: 'rgba(15, 15, 26, 0.85)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Partida
        </span>
        <span className="flex items-center gap-1 text-purple-300">
          <span className="w-2 h-2 rounded-full bg-brand-500" /> Paradas ({stops.length})
        </span>
      </div>
    </div>
  );
}
