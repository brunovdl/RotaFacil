import { Injectable } from '@nestjs/common';

interface GeocodeResult {
  lat: number;
  lng: number;
}

interface CacheEntry {
  result: GeocodeResult;
  expiresAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
const CACHE_MAX_SIZE = 1000;

@Injectable()
export class GeocodingService {
  private cache = new Map<string, CacheEntry>();

  async geocode(
    street: string,
    number: string,
    city: string,
    state: string,
  ): Promise<GeocodeResult> {
    const query = `${street}, ${number}, ${city}, ${state}, Brasil`;
    const cacheKey = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (this.cache.has(cacheKey)) {
      const entry = this.cache.get(cacheKey)!;
      if (entry.expiresAt > Date.now()) {
        return entry.result;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&accept-language=pt`,
        {
          headers: {
            'User-Agent': 'RotaFacil/1.0',
          },
        },
      );

      if (!response.ok) {
        return this.fallbackGeocode(city, state);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
        this.setCacheEntry(cacheKey, result);
        return result;
      }

      return this.fallbackGeocode(city, state);
    } catch {
      return this.fallbackGeocode(city, state);
    }
  }

  private async fallbackGeocode(city: string, state: string): Promise<GeocodeResult> {
    const query = `${city}, ${state}, Brasil`;
    const encoded = encodeURIComponent(query);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1&accept-language=pt`,
        {
          headers: { 'User-Agent': 'RotaFacil/1.0' },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return {
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          };
        }
      }
    } catch {
      // ignore
    }

    // Default to city center coordinates based on state (rough approximation)
    const stateCenters: Record<string, GeocodeResult> = {
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

    return stateCenters[state] || { lat: -15.7975, lng: -47.8919 };
  }

  async batchGeocode(
    addresses: Array<{ street: string; number: string; city: string; state: string }>,
  ): Promise<GeocodeResult[]> {
    const results: GeocodeResult[] = [];
    for (const addr of addresses) {
      const result = await this.geocode(addr.street, addr.number, addr.city, addr.state);
      results.push(result);
      // Small delay to respect Nominatim rate limits
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    return results;
  }

  private setCacheEntry(key: string, result: GeocodeResult): void {
    // Evita crescimento ilimitado: remove a entrada mais antiga se atingir o limite
    if (this.cache.size >= CACHE_MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { result, expiresAt: Date.now() + CACHE_TTL_MS });
  }
}
