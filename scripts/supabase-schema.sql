-- PortConnect Database Schema
-- Complete database setup for production deployment
-- This file contains all tables, triggers, functions, RLS policies, and sample data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.reservations CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.ports CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.service_type CASCADE;
DROP TYPE IF EXISTS public.reservation_status CASCADE;
DROP TYPE IF EXISTS public.approval_status CASCADE;

-- Create custom types
CREATE TYPE public.user_role AS ENUM ('captain', 'provider', 'terminal');
CREATE TYPE public.service_type AS ENUM ('tugboat', 'bunkering', 'cleaning', 'maintenance', 'docking');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'confirmed', 'rejected', 'completed', 'cancelled');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Create ports table
CREATE TABLE public.ports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    location VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role public.user_role DEFAULT 'captain',
    company VARCHAR(255),
    port_id UUID REFERENCES public.ports(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    port_id UUID NOT NULL REFERENCES public.ports(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type public.service_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_hour DECIMAL(10,2) NOT NULL,
    availability_start TIME DEFAULT '00:00:00',
    availability_end TIME DEFAULT '23:59:59',
    max_duration_hours INTEGER DEFAULT 24,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table with dual approval system
CREATE TABLE public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    captain_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    vessel_name VARCHAR(255) NOT NULL,
    vessel_imo VARCHAR(20),
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_hours INTEGER NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    special_requirements TEXT,
    
    -- Overall reservation status
    status public.reservation_status DEFAULT 'pending',
    
    -- Individual approval tracking
    terminal_approval public.approval_status DEFAULT 'pending',
    provider_approval public.approval_status DEFAULT 'pending',
    
    -- Approval timestamps
    terminal_approved_at TIMESTAMP WITH TIME ZONE,
    provider_approved_at TIMESTAMP WITH TIME ZONE,
    terminal_approved_by UUID REFERENCES public.users(id),
    provider_approved_by UUID REFERENCES public.users(id),
    
    -- Rejection reasons
    terminal_rejection_reason TEXT,
    provider_rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_port_id ON public.users(port_id);
CREATE INDEX idx_services_port_id ON public.services(port_id);
CREATE INDEX idx_services_provider_id ON public.services(provider_id);
CREATE INDEX idx_services_type ON public.services(type);
CREATE INDEX idx_reservations_service_id ON public.reservations(service_id);
CREATE INDEX idx_reservations_captain_id ON public.reservations(captain_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_scheduled_start ON public.reservations(scheduled_start);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ports_updated_at BEFORE UPDATE ON public.ports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for dual approval logic
CREATE OR REPLACE FUNCTION public.update_reservation_status()
RETURNS TRIGGER AS $$
BEGIN
    -- If either approval is rejected, mark reservation as rejected
    IF NEW.terminal_approval = 'rejected' OR NEW.provider_approval = 'rejected' THEN
        NEW.status = 'rejected';
    -- If both approvals are approved, mark reservation as confirmed
    ELSIF NEW.terminal_approval = 'approved' AND NEW.provider_approval = 'approved' THEN
        NEW.status = 'confirmed';
    -- Otherwise, keep as pending
    ELSE
        NEW.status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for dual approval
CREATE TRIGGER trigger_update_reservation_status
    BEFORE UPDATE ON public.reservations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reservation_status();

-- Enable Row Level Security (RLS)
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ports table
CREATE POLICY "Ports are viewable by everyone" ON public.ports
    FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert ports" ON public.ports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only authenticated users can update ports" ON public.ports
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for services table
CREATE POLICY "Services are viewable by everyone" ON public.services
    FOR SELECT USING (true);

CREATE POLICY "Providers can insert their own services" ON public.services
    FOR INSERT WITH CHECK (
        auth.uid() = provider_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'provider')
    );

CREATE POLICY "Providers can update their own services" ON public.services
    FOR UPDATE USING (
        auth.uid() = provider_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'provider')
    );

CREATE POLICY "Providers can delete their own services" ON public.services
    FOR DELETE USING (
        auth.uid() = provider_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'provider')
    );

-- RLS Policies for reservations table
CREATE POLICY "Users can view reservations they're involved in" ON public.reservations
    FOR SELECT USING (
        auth.uid() = captain_id OR 
        auth.uid() IN (
            SELECT provider_id FROM public.services WHERE id = service_id
        ) OR
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'terminal' AND port_id IN (
                SELECT port_id FROM public.services WHERE id = service_id
            )
        )
    );

-- Insert sample data

-- Sample ports
INSERT INTO public.ports (id, name, code, location, country, timezone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Port of Santos', 'BRSSZ', 'Santos, São Paulo', 'Brazil', 'America/Sao_Paulo'),
('550e8400-e29b-41d4-a716-446655440002', 'Port of Rotterdam', 'NLRTM', 'Rotterdam', 'Netherlands', 'Europe/Amsterdam'),
('550e8400-e29b-41d4-a716-446655440003', 'Port of Singapore', 'SGSIN', 'Singapore', 'Singapore', 'Asia/Singapore'),
('550e8400-e29b-41d4-a716-446655440004', 'Port of Los Angeles', 'USLAX', 'Los Angeles, California', 'United States', 'America/Los_Angeles'),
('550e8400-e29b-41d4-a716-446655440005', 'Port of Hamburg', 'DEHAM', 'Hamburg', 'Germany', 'Europe/Berlin'),
('550e8400-e29b-41d4-a716-446655440006', 'Port of Antwerp', 'BEANR', 'Antwerp', 'Belgium', 'Europe/Brussels'),
('550e8400-e29b-41d4-a716-446655440007', 'Port of Shanghai', 'CNSHA', 'Shanghai', 'China', 'Asia/Shanghai'),
('550e8400-e29b-41d4-a716-446655440008', 'Port of Jebel Ali', 'AEJEA', 'Dubai', 'United Arab Emirates', 'Asia/Dubai');

-- Sample users (Note: In production, these would be created through authentication)
-- Terminal users
INSERT INTO public.users (id, email, name, role, company, port_id) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'terminal.santos@portconnect.com', 'Carlos Silva', 'terminal', 'Santos Port Authority', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440102', 'terminal.rotterdam@portconnect.com', 'Jan van der Berg', 'terminal', 'Port of Rotterdam Authority', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440103', 'terminal.singapore@portconnect.com', 'Li Wei', 'terminal', 'Maritime and Port Authority of Singapore', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440104', 'terminal.losangeles@portconnect.com', 'Michael Johnson', 'terminal', 'Port of Los Angeles', '550e8400-e29b-41d4-a716-446655440004');

-- Provider users
INSERT INTO public.users (id, email, name, role, company, port_id) VALUES
('550e8400-e29b-41d4-a716-446655440201', 'provider.tugboat@portconnect.com', 'Maria Santos', 'provider', 'Santos Tugboat Services', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655440202', 'provider.bunkering@portconnect.com', 'Erik Johansson', 'provider', 'Rotterdam Marine Fuel', '550e8400-e29b-41d4-a716-446655440002'),
('550e8400-e29b-41d4-a716-446655440203', 'provider.maintenance@portconnect.com', 'Raj Patel', 'provider', 'Singapore Ship Repair', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440204', 'provider.cleaning@portconnect.com', 'David Martinez', 'provider', 'LA Port Cleaning Co.', '550e8400-e29b-41d4-a716-446655440004');

-- Captain users
INSERT INTO public.users (id, email, name, role, company, port_id) VALUES
('550e8400-e29b-41d4-a716-446655440301', 'captain.silva@portconnect.com', 'Captain João Silva', 'captain', 'Brazilian Shipping Lines', NULL),
('550e8400-e29b-41d4-a716-446655440302', 'captain.anderson@portconnect.com', 'Captain Lars Anderson', 'captain', 'Nordic Maritime', NULL),
('550e8400-e29b-41d4-a716-446655440303', 'captain.chen@portconnect.com', 'Captain Chen Wei', 'captain', 'Pacific Shipping Co.', NULL),
('550e8400-e29b-41d4-a716-446655440304', 'captain.rodriguez@portconnect.com', 'Captain Ana Rodriguez', 'captain', 'Global Cargo Lines', NULL);

-- Sample services
INSERT INTO public.services (id, port_id, provider_id, type, name, description, price_per_hour, availability_start, availability_end, max_duration_hours) VALUES
-- Santos Port Services
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440201', 'tugboat', 'Santos Tugboat Assistance', 'Professional tugboat services for vessel maneuvering in Santos Port', 850.00, '06:00:00', '22:00:00', 8),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440201', 'docking', 'Santos Docking Services', 'Complete docking assistance and berth allocation', 450.00, '00:00:00', '23:59:59', 24),

-- Rotterdam Port Services
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440202', 'bunkering', 'Rotterdam Marine Fuel Supply', 'High-quality marine fuel and bunkering services', 1200.00, '00:00:00', '23:59:59', 12),
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440202', 'tugboat', 'Rotterdam Tugboat Services', 'Advanced tugboat assistance with experienced crew', 950.00, '05:00:00', '23:00:00', 10),

-- Singapore Port Services
('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440203', 'maintenance', 'Singapore Ship Maintenance', 'Comprehensive ship maintenance and repair services', 750.00, '07:00:00', '19:00:00', 16),
('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440203', 'cleaning', 'Singapore Vessel Cleaning', 'Professional vessel cleaning and sanitation', 320.00, '06:00:00', '20:00:00', 8),

-- Los Angeles Port Services
('550e8400-e29b-41d4-a716-446655440407', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440204', 'cleaning', 'LA Port Cleaning Services', 'Eco-friendly vessel cleaning solutions', 380.00, '06:00:00', '18:00:00', 10),
('550e8400-e29b-41d4-a716-446655440408', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440204', 'docking', 'LA Docking and Berth Services', 'Premium docking services with modern facilities', 520.00, '00:00:00', '23:59:59', 24);

-- Sample reservations with different approval states
INSERT INTO public.reservations (
    id, service_id, captain_id, vessel_name, vessel_imo,
    scheduled_start, scheduled_end, duration_hours, total_cost,
    special_requirements, status, terminal_approval, provider_approval
) VALUES
-- Confirmed reservation (both approved)
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440301',
 'MV Atlantic Star', 'IMO1234567',
 NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 4 hours', 4, 3400.00,
 'Require experienced pilot for night operations', 'confirmed', 'approved', 'approved'),

-- Pending reservation (waiting for approvals)
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440302',
 'MV Nordic Explorer', 'IMO2345678',
 NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 6 hours', 6, 7200.00,
 'Need low-sulfur fuel for environmental compliance', 'pending', 'pending', 'pending'),

-- Partially approved reservation (terminal approved, provider pending)
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440303',
 'MV Pacific Voyager', 'IMO3456789',
 NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 8 hours', 8, 6000.00,
 'Engine maintenance required before departure', 'pending', 'approved', 'pending'),

-- Rejected reservation
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440407', '550e8400-e29b-41d4-a716-446655440304',
 'MV Global Trader', 'IMO4567890',
 NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 6 hours', 6, 2280.00,
 'Standard cleaning service', 'rejected', 'rejected', 'pending');

-- Create a view for reservation details (useful for reporting)
CREATE OR REPLACE VIEW public.reservation_details AS
SELECT
    r.id,
    r.vessel_name,
    r.vessel_imo,
    r.scheduled_start,
    r.scheduled_end,
    r.duration_hours,
    r.total_cost,
    r.status,
    r.terminal_approval,
    r.provider_approval,
    r.special_requirements,
    s.name as service_name,
    s.type as service_type,
    p.name as port_name,
    p.code as port_code,
    c.name as captain_name,
    c.company as captain_company,
    pr.name as provider_name,
    pr.company as provider_company,
    t.name as terminal_contact_name
FROM public.reservations r
JOIN public.services s ON r.service_id = s.id
JOIN public.ports p ON s.port_id = p.id
JOIN public.users c ON r.captain_id = c.id
JOIN public.users pr ON s.provider_id = pr.id
LEFT JOIN public.users t ON t.port_id = p.id AND t.role = 'terminal';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Final verification queries (commented out for production)
-- SELECT 'Ports created: ' || COUNT(*) FROM public.ports;
-- SELECT 'Users created: ' || COUNT(*) FROM public.users;
-- SELECT 'Services created: ' || COUNT(*) FROM public.services;
-- SELECT 'Reservations created: ' || COUNT(*) FROM public.reservations;

-- Schema setup complete
-- This schema provides:
-- 1. Complete table structure with proper relationships
-- 2. Dual approval system for reservations
-- 3. Row Level Security (RLS) policies
-- 4. Sample data for testing
-- 5. Indexes for performance
-- 6. Triggers for automatic status updates
-- 7. Views for complex queries

CREATE POLICY "Captains can insert reservations" ON public.reservations
    FOR INSERT WITH CHECK (
        auth.uid() = captain_id AND 
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'captain')
    );

CREATE POLICY "Involved parties can update reservations" ON public.reservations
    FOR UPDATE USING (
        auth.uid() = captain_id OR 
        auth.uid() IN (
            SELECT provider_id FROM public.services WHERE id = service_id
        ) OR
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'terminal' AND port_id IN (
                SELECT port_id FROM public.services WHERE id = service_id
            )
        )
    );
