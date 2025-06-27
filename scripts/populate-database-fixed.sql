-- PortConnect Database Population Script (Fixed Version)
-- This script populates the database with sample terminal services data
-- Note: Users must be created through Supabase Auth first

-- First, let's extend the service_type enum to include more service types
DO $$ 
BEGIN
    -- Add new service types if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'cargo_handling' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_type')) THEN
        ALTER TYPE service_type ADD VALUE 'cargo_handling';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'vessel_berthing' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_type')) THEN
        ALTER TYPE service_type ADD VALUE 'vessel_berthing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pilotage' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_type')) THEN
        ALTER TYPE service_type ADD VALUE 'pilotage';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'customs_clearance' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_type')) THEN
        ALTER TYPE service_type ADD VALUE 'customs_clearance';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'waste_disposal' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_type')) THEN
        ALTER TYPE service_type ADD VALUE 'waste_disposal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'security' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'service_type')) THEN
        ALTER TYPE service_type ADD VALUE 'security';
    END IF;
END $$;

-- Clear existing sample data (be careful in production!)
DELETE FROM public.reservations WHERE ship_name LIKE 'Sample%' OR ship_name LIKE 'MV %' OR ship_name LIKE 'MSC %';
DELETE FROM public.services WHERE name LIKE '%Sample%' OR description LIKE '%Sample%';
DELETE FROM public.ports WHERE code IN ('DEMO', 'SMPL', 'TEST');

-- Insert sample ports (this should work as ports don't have auth constraints)
INSERT INTO public.ports (id, name, code, location, timezone) VALUES
    (gen_random_uuid(), 'Port of Santos', 'BRSSZ', 'Santos, São Paulo, Brazil', 'America/Sao_Paulo'),
    (gen_random_uuid(), 'Port of Rotterdam', 'NLRTM', 'Rotterdam, Netherlands', 'Europe/Amsterdam'),
    (gen_random_uuid(), 'Port of Singapore', 'SGSIN', 'Singapore', 'Asia/Singapore'),
    (gen_random_uuid(), 'Port of Los Angeles', 'USLAX', 'Los Angeles, California, USA', 'America/Los_Angeles'),
    (gen_random_uuid(), 'Port of Hamburg', 'DEHAM', 'Hamburg, Germany', 'Europe/Berlin'),
    (gen_random_uuid(), 'Port of Antwerp', 'BEANR', 'Antwerp, Belgium', 'Europe/Brussels'),
    (gen_random_uuid(), 'Port of Shanghai', 'CNSHA', 'Shanghai, China', 'Asia/Shanghai'),
    (gen_random_uuid(), 'Port of Dubai', 'AEJEA', 'Dubai, UAE', 'Asia/Dubai')
ON CONFLICT (code) DO NOTHING;

-- Display summary of inserted ports
SELECT
    'Ports inserted' as status,
    COUNT(*) as count
FROM public.ports
WHERE code IN ('BRSSZ', 'NLRTM', 'SGSIN', 'USLAX', 'DEHAM', 'BEANR', 'CNSHA', 'AEJEA');

-- Instructions for manual user creation
SELECT 'IMPORTANT: You must create users through Supabase Auth first!' as instruction;
SELECT 'Then update their profiles using the UPDATE statements below.' as instruction2;

-- =====================================================
-- COMPREHENSIVE SERVICES POPULATION SCRIPT
-- =====================================================
-- This section populates the services table with realistic sample data
-- covering all 10 supported service types across multiple ports and providers

-- Insert comprehensive sample services using existing ports and providers
WITH port_data AS (
    SELECT id as port_id, code, name as port_name
    FROM public.ports
    WHERE code IN ('BRSSZ', 'NLRTM', 'SGSIN', 'USLAX', 'DEHAM', 'BEANR', 'CNSHA', 'AEJEA')
),
provider_data AS (
    SELECT id as provider_id, email, name as provider_name
    FROM public.users
    WHERE role = 'provider'
),
service_definitions AS (
    SELECT * FROM (VALUES
        -- Santos Port Services (BRSSZ)
        ('Santos Professional Tugboat Services', 'tugboat', 'High-powered tugboat assistance for vessel maneuvering and emergency response in Santos port waters', 'BRSSZ', 450.00),
        ('Santos Integrated Cargo Handling', 'cargo_handling', 'Complete cargo loading and unloading services with modern container and bulk handling equipment', 'BRSSZ', 285.00),
        ('Santos Marine Fuel Supply', 'bunkering', 'Premium marine fuel supply including MGO, HFO, and LSFO with quality certificates and fast delivery', 'BRSSZ', 820.00),
        ('Santos Comprehensive Ship Cleaning', 'cleaning', 'Professional vessel cleaning including hull, deck, accommodation areas, and tank cleaning services', 'BRSSZ', 125.00),
        ('Santos Customs Clearance Services', 'customs_clearance', 'Brazilian customs clearance, documentation processing, and regulatory compliance services', 'BRSSZ', 180.00),

        -- Rotterdam Port Services (NLRTM)
        ('Rotterdam Expert Pilotage', 'pilotage', 'Experienced pilots for safe navigation through Rotterdam port complex and Nieuwe Waterweg', 'NLRTM', 420.00),
        ('Rotterdam Automated Container Handling', 'cargo_handling', 'State-of-the-art automated container terminal services with 24/7 operations and rail connections', 'NLRTM', 340.00),
        ('Rotterdam Ship Maintenance Hub', 'maintenance', 'Complete ship repair facility with dry dock services, engine maintenance, and certified technicians', 'NLRTM', 580.00),
        ('Rotterdam Environmental Waste Management', 'waste_disposal', 'MARPOL compliant waste collection, treatment, and disposal services for all waste categories', 'NLRTM', 195.00),
        ('Rotterdam Secure Vessel Berthing', 'vessel_berthing', 'Premium berthing facilities with advanced mooring systems and 24/7 security monitoring', 'NLRTM', 220.00),

        -- Singapore Port Services (SGSIN)
        ('Singapore Maritime Pilotage Authority', 'pilotage', 'Mandatory pilotage services for vessels entering Singapore waters with certified local pilots', 'SGSIN', 480.00),
        ('Singapore Heavy-Duty Tugboat Fleet', 'tugboat', 'High-powered tugboat services for large vessel assistance, emergency response, and harbor operations', 'SGSIN', 520.00),
        ('Singapore Premium Bunkering Hub', 'bunkering', 'World-class bunkering services with all fuel grades, quality assurance, and rapid delivery systems', 'SGSIN', 780.00),
        ('Singapore Port Security Services', 'security', 'ISPS compliant security services, vessel inspections, and maritime security assessments', 'SGSIN', 240.00),
        ('Singapore Advanced Cargo Operations', 'cargo_handling', 'Cutting-edge cargo handling with automated systems, AI optimization, and multimodal connections', 'SGSIN', 380.00),

        -- Los Angeles Port Services (USLAX)
        ('LA Heavy-Duty Tugboat Operations', 'tugboat', 'Powerful tugboat services for large container vessels, tankers, and cruise ships in LA harbor', 'USLAX', 550.00),
        ('LA Automated Cargo Terminal', 'cargo_handling', 'Advanced cargo handling with automated cranes, rail connections, and truck gate systems', 'USLAX', 420.00),
        ('LA Customs and Border Protection', 'customs_clearance', 'US Customs and Border Protection clearance services with expedited processing options', 'USLAX', 160.00),
        ('LA Eco-Friendly Ship Cleaning', 'cleaning', 'Environmentally responsible ship cleaning with waste water treatment and green cleaning products', 'USLAX', 145.00),
        ('LA Maritime Security Operations', 'security', 'Comprehensive port security services including vessel screening and cargo inspection', 'USLAX', 210.00),

        -- Hamburg Port Services (DEHAM)
        ('Hamburg Premium Maintenance Facility', 'maintenance', 'Complete ship repair and maintenance facility with certified technicians and modern equipment', 'DEHAM', 620.00),
        ('Hamburg Elbe River Tugboat Services', 'tugboat', 'Specialized tugboat fleet for Elbe river navigation and Hamburg port operations', 'DEHAM', 460.00),
        ('Hamburg Multi-Purpose Cargo Terminal', 'cargo_handling', 'Versatile cargo terminal with heavy lift capabilities, breakbulk, and container handling', 'DEHAM', 360.00),
        ('Hamburg Premium Berthing Services', 'vessel_berthing', 'Secure berthing facilities for all vessel types with advanced mooring and utility connections', 'DEHAM', 200.00),
        ('Hamburg Waste Management Solutions', 'waste_disposal', 'Comprehensive waste collection and disposal services compliant with German environmental standards', 'DEHAM', 185.00)
    ) AS services(service_name, service_type, service_description, port_code, price_per_hour)
)
INSERT INTO public.services (id, name, type, description, port_id, provider_id, price_per_hour, availability)
SELECT
    gen_random_uuid(),
    sd.service_name,
    sd.service_type::service_type,
    sd.service_description,
    pd.port_id,
    -- Distribute services among available providers using modulo
    (SELECT provider_id FROM provider_data ORDER BY random() LIMIT 1),
    sd.price_per_hour,
    true
FROM service_definitions sd
JOIN port_data pd ON pd.code = sd.port_code
WHERE EXISTS (SELECT 1 FROM provider_data) -- Only insert if providers exist
ON CONFLICT (name) DO NOTHING;

-- Additional services for remaining ports and service types
WITH port_data AS (
    SELECT id as port_id, code, name as port_name
    FROM public.ports
    WHERE code IN ('BEANR', 'CNSHA', 'AEJEA')
),
provider_data AS (
    SELECT id as provider_id, email, name as provider_name
    FROM public.users
    WHERE role = 'provider'
),
additional_services AS (
    SELECT * FROM (VALUES
        -- Antwerp Port Services (BEANR)
        ('Antwerp Scheldt River Pilotage', 'pilotage', 'Expert pilotage services for Scheldt river navigation and Antwerp port complex entry', 'BEANR', 390.00),
        ('Antwerp Chemical Cargo Specialists', 'cargo_handling', 'Specialized handling of chemical and petrochemical cargo with certified safety protocols', 'BEANR', 450.00),
        ('Antwerp Marine Fuel Terminal', 'bunkering', 'Strategic bunkering location with all fuel types, quality control, and efficient delivery', 'BEANR', 750.00),
        ('Antwerp Ship Maintenance Cluster', 'maintenance', 'Comprehensive ship repair services with specialized facilities for chemical tankers', 'BEANR', 540.00),
        ('Antwerp Vessel Cleaning Specialists', 'cleaning', 'Professional vessel cleaning with expertise in chemical tank cleaning and decontamination', 'BEANR', 165.00),

        -- Shanghai Port Services (CNSHA)
        ('Shanghai Yangtze River Tugboat Fleet', 'tugboat', 'Powerful tugboat services for Yangtze river navigation and Shanghai port operations', 'CNSHA', 480.00),
        ('Shanghai Mega Container Terminal', 'cargo_handling', 'World-largest container terminal with automated systems and deep-water berths', 'CNSHA', 320.00),
        ('Shanghai Customs Clearance Hub', 'customs_clearance', 'Chinese customs clearance services with bonded warehouse facilities and trade facilitation', 'CNSHA', 140.00),
        ('Shanghai Port Security Division', 'security', 'Advanced port security with biometric systems, cargo scanning, and maritime patrol services', 'CNSHA', 190.00),
        ('Shanghai Waste Treatment Center', 'waste_disposal', 'Modern waste processing facility handling all types of ship-generated waste and recyclables', 'CNSHA', 155.00),

        -- Dubai Port Services (AEJEA)
        ('Dubai Premium Tugboat Services', 'tugboat', 'High-performance tugboat fleet serving Dubai ports and offshore operations', 'AEJEA', 500.00),
        ('Dubai Jebel Ali Cargo Hub', 'cargo_handling', 'Strategic cargo handling facility connecting Asia, Europe, and Africa with modern equipment', 'AEJEA', 400.00),
        ('Dubai Marine Services Center', 'maintenance', 'State-of-the-art ship repair facility with floating dry dock and specialized marine services', 'AEJEA', 650.00),
        ('Dubai Secure Berthing Complex', 'vessel_berthing', 'Premium berthing facilities with advanced security systems and VIP vessel services', 'AEJEA', 280.00),
        ('Dubai Customs Free Zone', 'customs_clearance', 'UAE customs clearance with free zone benefits and expedited processing for international trade', 'AEJEA', 120.00)
    ) AS services(service_name, service_type, service_description, port_code, price_per_hour)
)
INSERT INTO public.services (id, name, type, description, port_id, provider_id, price_per_hour, availability)
SELECT
    gen_random_uuid(),
    ads.service_name,
    ads.service_type::service_type,
    ads.service_description,
    pd.port_id,
    -- Distribute services among available providers
    (SELECT provider_id FROM provider_data ORDER BY random() LIMIT 1),
    ads.price_per_hour,
    true
FROM additional_services ads
JOIN port_data pd ON pd.code = ads.port_code
WHERE EXISTS (SELECT 1 FROM provider_data)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFICATION AND SUMMARY QUERIES
-- =====================================================

-- Display summary of inserted services
SELECT
    'Services Summary' as report_type,
    COUNT(*) as total_services,
    COUNT(DISTINCT type) as service_types_covered,
    COUNT(DISTINCT port_id) as ports_with_services,
    COUNT(DISTINCT provider_id) as active_providers
FROM public.services;

-- Services by type distribution
SELECT
    'Service Type Distribution' as report_type,
    type as service_type,
    COUNT(*) as service_count,
    ROUND(AVG(price_per_hour), 2) as avg_price_per_hour,
    MIN(price_per_hour) as min_price,
    MAX(price_per_hour) as max_price
FROM public.services
GROUP BY type
ORDER BY service_count DESC;

-- Services by port distribution
SELECT
    'Port Distribution' as report_type,
    p.name as port_name,
    p.code as port_code,
    COUNT(s.id) as service_count,
    ROUND(AVG(s.price_per_hour), 2) as avg_price_per_hour
FROM public.ports p
LEFT JOIN public.services s ON p.id = s.port_id
GROUP BY p.id, p.name, p.code
ORDER BY service_count DESC;

-- Provider service distribution
SELECT
    'Provider Distribution' as report_type,
    u.name as provider_name,
    u.company as company_name,
    COUNT(s.id) as services_offered,
    ROUND(AVG(s.price_per_hour), 2) as avg_service_price
FROM public.users u
LEFT JOIN public.services s ON u.id = s.provider_id
WHERE u.role = 'provider'
GROUP BY u.id, u.name, u.company
ORDER BY services_offered DESC;

-- Final status check
SELECT
    CASE
        WHEN COUNT(*) >= 25 THEN '✅ SUCCESS: Comprehensive service data populated'
        WHEN COUNT(*) >= 15 THEN '⚠️  PARTIAL: Some services populated, may need more providers'
        ELSE '❌ FAILED: Insufficient services populated, check provider accounts'
    END as population_status,
    COUNT(*) as total_services_created
FROM public.services;

-- Example UPDATE statements to run AFTER creating auth users
-- These should be run individually after creating each user through the auth system

/*
-- After creating auth users, update their profiles with these commands:

-- Service Providers
UPDATE public.users SET 
    name = 'Santos Tugboat Services', 
    role = 'provider', 
    company = 'Santos Maritime Solutions' 
WHERE email = 'santos.tugboat@demo.com';

UPDATE public.users SET 
    name = 'Rotterdam Cargo Handlers', 
    role = 'provider', 
    company = 'Rotterdam Port Services BV' 
WHERE email = 'rotterdam.cargo@demo.com';

UPDATE public.users SET 
    name = 'Singapore Pilotage Corp', 
    role = 'provider', 
    company = 'Maritime and Port Authority of Singapore' 
WHERE email = 'singapore.pilot@demo.com';

UPDATE public.users SET 
    name = 'LA Bunkering Solutions', 
    role = 'provider', 
    company = 'Pacific Marine Fuels' 
WHERE email = 'la.bunkering@demo.com';

UPDATE public.users SET 
    name = 'Hamburg Ship Maintenance', 
    role = 'provider', 
    company = 'Blohm+Voss Service GmbH' 
WHERE email = 'hamburg.maintenance@demo.com';

-- Terminal Operators
UPDATE public.users SET 
    name = 'Santos Terminal Manager', 
    role = 'terminal', 
    company = 'Santos Port Authority' 
WHERE email = 'terminal.santos@demo.com';

UPDATE public.users SET 
    name = 'Rotterdam Terminal Operator', 
    role = 'terminal', 
    company = 'Port of Rotterdam Authority' 
WHERE email = 'terminal.rotterdam@demo.com';

-- Ship Captains
UPDATE public.users SET 
    name = 'Captain John Smith', 
    role = 'captain', 
    company = 'Maersk Line' 
WHERE email = 'captain.smith@demo.com';

UPDATE public.users SET 
    name = 'Captain Maria Rodriguez', 
    role = 'captain', 
    company = 'MSC Mediterranean Shipping' 
WHERE email = 'captain.rodriguez@demo.com';

UPDATE public.users SET 
    name = 'Captain Li Chen', 
    role = 'captain', 
    company = 'COSCO Shipping Lines' 
WHERE email = 'captain.chen@demo.com';
*/
