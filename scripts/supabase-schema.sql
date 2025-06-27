-- PortConnect Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE user_role AS ENUM ('terminal', 'provider', 'captain');
CREATE TYPE service_type AS ENUM ('tugboat', 'bunkering', 'cleaning', 'maintenance');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');

-- Users table (extends auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'captain',
    company TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ports table
CREATE TABLE public.ports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type service_type NOT NULL,
    description TEXT,
    port_id UUID REFERENCES public.ports(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    price_per_hour DECIMAL(10,2),
    availability BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reservations table
CREATE TABLE public.reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
    captain_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ship_name TEXT NOT NULL,
    ship_imo TEXT,
    requested_date DATE NOT NULL,
    requested_time TIME NOT NULL,
    duration_hours INTEGER NOT NULL DEFAULT 1,
    status reservation_status DEFAULT 'pending',
    notes TEXT,
    provider_notes TEXT,
    total_cost DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_services_port_id ON public.services(port_id);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_type ON public.services(type);
CREATE INDEX idx_reservations_service_id ON public.reservations(service_id);
CREATE INDEX idx_reservations_captain_id ON public.reservations(captain_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_date ON public.reservations(requested_date);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for ports table (public read access)
CREATE POLICY "Anyone can view ports" ON public.ports
    FOR SELECT USING (true);

CREATE POLICY "Only terminal operators can manage ports" ON public.ports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'terminal'
        )
    );

-- RLS Policies for services table
CREATE POLICY "Anyone can view available services" ON public.services
    FOR SELECT USING (availability = true);

CREATE POLICY "Providers can manage their own services" ON public.services
    FOR ALL USING (provider_id = auth.uid());

CREATE POLICY "Terminal operators can view all services" ON public.services
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'terminal'
        )
    );

-- RLS Policies for reservations table
CREATE POLICY "Captains can view their own reservations" ON public.reservations
    FOR SELECT USING (captain_id = auth.uid());

CREATE POLICY "Captains can create reservations" ON public.reservations
    FOR INSERT WITH CHECK (captain_id = auth.uid());

CREATE POLICY "Captains can update their own reservations" ON public.reservations
    FOR UPDATE USING (captain_id = auth.uid());

CREATE POLICY "Providers can view reservations for their services" ON public.reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.services 
            WHERE id = service_id AND provider_id = auth.uid()
        )
    );

CREATE POLICY "Providers can update reservations for their services" ON public.reservations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.services 
            WHERE id = service_id AND provider_id = auth.uid()
        )
    );

CREATE POLICY "Terminal operators can view all reservations" ON public.reservations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'terminal'
        )
    );

-- Functions to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ports_updated_at BEFORE UPDATE ON public.ports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO public.ports (name, code, location, timezone) VALUES
    ('Port of Santos', 'BRSSZ', 'Santos, Brazil', 'America/Sao_Paulo'),
    ('Port of Rotterdam', 'NLRTM', 'Rotterdam, Netherlands', 'Europe/Amsterdam'),
    ('Port of Singapore', 'SGSIN', 'Singapore', 'Asia/Singapore'),
    ('Port of Los Angeles', 'USLAX', 'Los Angeles, USA', 'America/Los_Angeles');

-- Note: Users, services, and reservations will be created through the application
