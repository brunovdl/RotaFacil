export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface Route {
  id: string;
  user_id: string;
  name: string;
  start_lat: number;
  start_lng: number;
  total_distance_km: number;
  estimated_duration_min: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  stops?: RouteStop[];
}

export interface RouteStop {
  id: string;
  route_id: string;
  order_index: number;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  completed: boolean;
  status?: 'pending' | 'completed' | 'skipped' | 'failed';
  skip_reason?: string;
  notes?: string;
  distanceFromPrevious?: number;
  distanceFromStart?: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  trial_ends_at: string;
  active: boolean;
  isExpired?: boolean;
  daysRemaining?: number;
}

export interface CepResult {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  source: string;
}

export interface DashboardStats {
  todayRoutes: number;
  totalStops: number;
  currentRoute: {
    id: string;
    name: string;
    totalDistance: number;
    estimatedDuration: number;
  } | null;
}
