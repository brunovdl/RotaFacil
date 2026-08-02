export function formatCep(cep: string): string {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return cep;
  return `${clean.slice(0, 5)}-${clean.slice(5)}`;
}

export function formatDistanceKm(km: number): string {
  return `${km.toFixed(1).replace('.', ',')} km`;
}

export function formatDurationMin(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const hours = Math.floor(min / 60);
  const remainingMin = Math.round(min % 60);
  return `${hours}h ${remainingMin}min`;
}
