export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  const rounded = Math.round(km * 10) / 10;
  return `${rounded} km`;
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${m > 0 ? m : ''}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function getGoogleMapsMultiStopUrl(
  originLat: number,
  originLng: number,
  stops: Array<{ lat: number; lng: number }>,
): string {
  if (stops.length === 0) return getGoogleMapsUrl(originLat, originLng);

  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(0, -1)
    .map((s) => `${s.lat},${s.lng}`)
    .join('|');

  let url = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destination.lat},${destination.lng}`;

  if (waypoints) {
    url += `&waypoints=${waypoints}`;
  }

  return url;
}

export function getWazeUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

export function getWazeMultiStopUrl(
  originLat: number,
  originLng: number,
  stops: Array<{ lat: number; lng: number }>,
): string {
  if (stops.length === 0) return getWazeUrl(originLat, originLng);
  if (stops.length === 1) return getWazeUrl(stops[0].lat, stops[0].lng);

  const coords = stops.map((s) => `${s.lat},${s.lng}`).join(';');
  return `https://waze.com/ul?ll=${stops[0].lat},${stops[0].lng}&navigate=yes&stop=${coords}`;
}

export function openExternalNavigation(
  lat: number,
  lng: number,
  app: 'google_maps' | 'waze',
): void {
  const url = app === 'google_maps' ? getGoogleMapsUrl(lat, lng) : getWazeUrl(lat, lng);
  window.open(url, '_blank');
}

export function openMultiStopNavigation(
  origin: { lat: number; lng: number },
  stops: Array<{ lat: number; lng: number }>,
  app: 'google_maps' | 'waze',
): void {
  if (stops.length === 0) return;

  const url =
    app === 'google_maps'
      ? getGoogleMapsMultiStopUrl(origin.lat, origin.lng, stops)
      : getWazeMultiStopUrl(origin.lat, origin.lng, stops);

  window.open(url, '_blank');
}

export function formatCep(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
}

export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

export function parseOcrResult(text: string): { cep: string; number: string } {
  let cep = '';
  let number = '';

  const cepRegex = /\b(\d{5}[-\s]?\d{3})\b/g;
  const cepMatch = cepRegex.exec(text);
  if (cepMatch) {
    cep = onlyNumbers(cepMatch[1]);
  }

  const lines = text.split('\n');
  for (const line of lines) {
    const numMatch = line.match(/(?:N[º°]?|n[º°]?|numero|número)\s*[.:]?\s*(\d+)/i);
    if (numMatch) {
      number = numMatch[1];
      break;
    }
  }

  if (!number) {
    for (const line of lines) {
      const standaloneNum = line.match(/\b(\d{1,5})\b/);
      if (standaloneNum && !line.match(/CEP|N[º°]|n[º°]|SAC|CNPJ|CPF|Fone|Tel|cel|\(\d{2}\)/i)) {
        number = standaloneNum[1];
        break;
      }
    }
  }

  return { cep, number };
}
