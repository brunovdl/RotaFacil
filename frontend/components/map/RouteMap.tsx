'use client';

import React from 'react';
import { RouteMap as InteractiveRouteMap } from '@/components/ui/route-map';

interface MapMarker {
  id?: string;
  lat: number;
  lng: number;
  label?: string;
  order?: number;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  completed?: boolean;
}

interface RouteMapProps {
  startPoint?: { lat: number; lng: number };
  markers?: MapMarker[];
  completedStopIds?: Set<string>;
  onSelectStop?: (stop: any) => void;
  selectedStopId?: string | null;
}

export function RouteMap({
  startPoint,
  markers = [],
  completedStopIds,
  onSelectStop,
  selectedStopId,
}: RouteMapProps) {
  const formattedStops = markers.map((m, idx) => ({
    id: m.id || `stop-${idx}`,
    order_index: m.order ?? idx + 1,
    street: m.street || m.label || 'Parada',
    number: m.number || '',
    neighborhood: m.neighborhood || '',
    city: m.city || '',
    state: m.state || '',
    lat: m.lat,
    lng: m.lng,
    completed: m.completed,
  }));

  return (
    <InteractiveRouteMap
      startLat={startPoint?.lat || 0}
      startLng={startPoint?.lng || 0}
      stops={formattedStops}
      completedStopIds={completedStopIds}
      onSelectStop={onSelectStop}
      selectedStopId={selectedStopId}
    />
  );
}

