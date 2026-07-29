-- RotaFácil - Supabase Database Schema
-- Execute this SQL in your Supabase SQL Editor to create the tables

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Routes table
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_lat NUMERIC NOT NULL,
  start_lng NUMERIC NOT NULL,
  total_distance_km NUMERIC DEFAULT 0,
  estimated_duration_min INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Route stops table
CREATE TABLE IF NOT EXISTS public.route_stops (
  id UUID PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  cep TEXT NOT NULL,
  street TEXT NOT NULL,
  number TEXT NOT NULL,
  complement TEXT,
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  completed BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON public.routes(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_created_at ON public.routes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON public.route_stops(route_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_order ON public.route_stops(route_id, order_index);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- Row Level Security Policies
-- Users can only access their own data
CREATE POLICY user_isolation ON public.users
  FOR ALL USING (id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY routes_user_isolation ON public.routes
  FOR ALL USING (user_id = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY stops_via_route ON public.route_stops
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.routes
      WHERE routes.id = route_stops.route_id
      AND (routes.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

CREATE POLICY subscriptions_user_isolation ON public.subscriptions
  FOR ALL USING (user_id = auth.uid() OR auth.uid() IS NULL);
