const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `Erro ${response.status}`,
    }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (name: string, email: string, password: string) =>
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
  },
  cep: {
    lookup: (cep: string) =>
      request<{ cep: string; street: string; neighborhood: string; city: string; state: string }>(
        `/cep/${cep}`,
      ),
  },
  routes: {
    create: (data: any) =>
      request<any>('/routes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    list: (page = 1, limit = 20) =>
      request<{ data: any[]; total: number }>(
        `/routes?page=${page}&limit=${limit}`,
      ),
    getById: (id: string) => request<any>(`/routes/${id}`),
    updateStatus: (id: string, status: string) =>
      request<any>(`/routes/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    duplicate: (id: string) =>
      request<any>(`/routes/${id}/duplicate`, { method: 'POST' }),
    delete: (id: string) =>
      request<any>(`/routes/${id}`, { method: 'DELETE' }),
    todayStats: () => request<any>('/routes/today-stats'),
  },
  stops: {
    complete: (stopId: string, routeId: string) =>
      request<any>(`/stops/${stopId}/complete`, {
        method: 'PUT',
        body: JSON.stringify({ routeId }),
      }),
    skip: (
      stopId: string,
      routeId: string,
      reason?: string,
      notes?: string,
      moveToEnd = true,
    ) =>
      request<any>(`/stops/${stopId}/skip`, {
        method: 'PUT',
        body: JSON.stringify({ routeId, reason, notes, moveToEnd }),
      }),
    resume: (stopId: string, routeId: string) =>
      request<any>(`/stops/${stopId}/resume`, {
        method: 'PUT',
        body: JSON.stringify({ routeId }),
      }),
    nextStop: (routeId: string) => request<any>(`/stops/next/${routeId}`),
  },
  subscriptions: {
    get: () => request<any>('/subscriptions'),
    activate: () =>
      request<any>('/subscriptions/activate', { method: 'POST' }),
    cancel: () => request<any>('/subscriptions/cancel', { method: 'POST' }),
  },
  reports: {
    operational: () => request<any>('/reports/operational'),
    performance: () => request<any>('/reports/performance'),
    kmByDay: (days = 30) => request<any>(`/reports/km-by-day?days=${days}`),
    deliveriesByWeek: (weeks = 12) =>
      request<any>(`/reports/deliveries-by-week?weeks=${weeks}`),
    routeCompletion: () => request<any>('/reports/route-completion'),
  },
  profile: {
    update: (data: { name?: string; email?: string }) =>
      request<any>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updatePassword: (password: string) =>
      request<any>('/users/password', {
        method: 'PUT',
        body: JSON.stringify({ password }),
      }),
    deleteAccount: () =>
      request<any>('/users/account', { method: 'DELETE' }),
  },
  vehicles: {
    get: () => request<any>('/vehicles'),
    update: (data: any) =>
      request<any>('/vehicles', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    registerOilChange: (odometer_km?: number) =>
      request<any>('/vehicles/oil-change', {
        method: 'POST',
        body: JSON.stringify({ odometer_km }),
      }),
    registerTireChange: (odometer_km?: number) =>
      request<any>('/vehicles/tire-change', {
        method: 'POST',
        body: JSON.stringify({ odometer_km }),
      }),
  },
};
