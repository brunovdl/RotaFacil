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

export interface VehicleAlerts {
  oil_due: boolean;
  oil_overdue: boolean;
  km_until_oil: number;
  next_oil_km: number;

  tire_due: boolean;
  tire_overdue: boolean;
  km_until_tire: number;
  next_tire_km: number;
}

export interface Vehicle {
  id: string | null;
  user_id: string;
  vehicle_type: 'car' | 'motorcycle' | 'van' | 'truck' | 'minibus' | 'other';
  odometer_km: number;
  fuel_type: 'gasoline' | 'alcohol' | 'diesel' | 'gas' | 'flex';
  km_per_liter: number;
  fuel_price_per_liter: number;
  oil_last_change_km: number;
  oil_change_interval_km: number;
  oil_type?: string;
  tire_last_change_km: number;
  tire_change_interval_km: number;
  alerts?: VehicleAlerts;
}
