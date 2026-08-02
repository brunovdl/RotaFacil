'use client';

import { useState, useCallback } from 'react';

export interface GeolocationPosition {
  lat: number;
  lng: number;
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não é suportada por este navegador.');
      return;
    }

    setLoading(true);
    setError(null);

    // 1ª tentativa: rápida (rede)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => {
        // 2ª tentativa: alta precisão (chip GPS)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setLoading(false);
          },
          (err) => {
            setLoading(false);
            if (err.code === 1) {
              setError('Permissão de GPS negada. Por favor, ative a localização ou digite o endereço manualmente.');
            } else {
              setError('Sinal de GPS indisponível. Utilize o formulário manual.');
            }
          },
          { enableHighAccuracy: true, timeout: 30000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  return { loading, position, error, captureLocation };
}
