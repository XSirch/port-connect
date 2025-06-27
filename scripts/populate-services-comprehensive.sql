-- =====================================================
-- PORTCONNECT COMPREHENSIVE SERVICES POPULATION SCRIPT
-- =====================================================
-- This script populates the PortConnect services table with realistic sample data
-- covering all 10 supported service types across multiple international ports.
--
-- Prerequisites:
-- 1. Ports must exist in the ports table
-- 2. Service providers must exist in the users table with role = 'provider'
-- 3. Service type enum must include all 10 types
--
-- Service Types Covered:
-- tugboat, bunkering, cleaning, maintenance, cargo_handling,
-- vessel_berthing, pilotage, customs_clearance, waste_disposal, security

-- First, ensure all service types exist in the enum
DO $$ 
BEGIN
    -- Add service types if they don't exist
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

-- Clear existing sample services to avoid duplicates
DELETE FROM public.services WHERE name LIKE '%Santos%' OR name LIKE '%Rotterdam%' OR name LIKE '%Singapore%' OR name LIKE '%LA %' OR name LIKE '%Hamburg%' OR name LIKE '%Antwerp%' OR name LIKE '%Shanghai%' OR name LIKE '%Dubai%';

-- =====================================================
-- COMPREHENSIVE SERVICES INSERTION
-- =====================================================

WITH port_data AS (
    -- Get available ports
    SELECT id as port_id, code, name as port_name 
    FROM public.ports 
    WHERE code IN ('BRSSZ', 'NLRTM', 'SGSIN', 'USLAX', 'DEHAM', 'BEANR', 'CNSHA', 'AEJEA')
),
provider_data AS (
    -- Get available service providers
    SELECT id as provider_id, email, name as provider_name, 
           ROW_NUMBER() OVER (ORDER BY created_at) as provider_rank
    FROM public.users 
    WHERE role = 'provider'
),
comprehensive_services AS (
    -- Define all 30 comprehensive services
    SELECT * FROM (VALUES
        -- SANTOS PORT (BRSSZ) - 5 services
        ('Santos Professional Tugboat Services', 'tugboat', 'High-powered tugboat assistance for vessel maneuvering, emergency response, and harbor operations in Santos port waters with 24/7 availability', 'BRSSZ', 450.00, 1),
        ('Santos Integrated Cargo Handling', 'cargo_handling', 'Complete cargo loading and unloading services with modern container handling equipment, bulk cargo facilities, and rail connections', 'BRSSZ', 285.00, 2),
        ('Santos Premium Marine Fuel Supply', 'bunkering', 'Premium marine fuel supply including MGO, HFO, LSFO, and VLSFO with quality certificates, fast delivery, and competitive pricing', 'BRSSZ', 820.00, 3),
        ('Santos Comprehensive Ship Cleaning', 'cleaning', 'Professional vessel cleaning including hull cleaning, deck washing, accommodation areas, and specialized tank cleaning services', 'BRSSZ', 125.00, 4),
        ('Santos Customs Clearance Center', 'customs_clearance', 'Brazilian customs clearance, documentation processing, regulatory compliance, and trade facilitation services', 'BRSSZ', 180.00, 5),
        
        -- ROTTERDAM PORT (NLRTM) - 5 services  
        ('Rotterdam Expert Pilotage Services', 'pilotage', 'Experienced maritime pilots for safe navigation through Rotterdam port complex, Nieuwe Waterweg, and North Sea approaches', 'NLRTM', 420.00, 1),
        ('Rotterdam Automated Container Terminal', 'cargo_handling', 'State-of-the-art automated container terminal with robotic cranes, 24/7 operations, and direct rail connections to European hinterland', 'NLRTM', 340.00, 2),
        ('Rotterdam Ship Maintenance Hub', 'maintenance', 'Complete ship repair facility with floating dry dock, engine maintenance, hull repairs, and certified marine technicians', 'NLRTM', 580.00, 3),
        ('Rotterdam Environmental Waste Management', 'waste_disposal', 'MARPOL compliant waste collection, treatment, and disposal services for all waste categories including hazardous materials', 'NLRTM', 195.00, 4),
        ('Rotterdam Secure Vessel Berthing', 'vessel_berthing', 'Premium berthing facilities with advanced mooring systems, shore power connections, and 24/7 security monitoring', 'NLRTM', 220.00, 5),
        
        -- SINGAPORE PORT (SGSIN) - 5 services
        ('Singapore Maritime Pilotage Authority', 'pilotage', 'Mandatory pilotage services for vessels entering Singapore territorial waters with certified local pilots and VTS coordination', 'SGSIN', 480.00, 1),
        ('Singapore Heavy-Duty Tugboat Fleet', 'tugboat', 'High-powered tugboat services for large vessel assistance, emergency response, and specialized harbor operations', 'SGSIN', 520.00, 2),
        ('Singapore World-Class Bunkering Hub', 'bunkering', 'Leading global bunkering services with all fuel grades, quality assurance, rapid delivery systems, and competitive pricing', 'SGSIN', 780.00, 3),
        ('Singapore Port Security Services', 'security', 'ISPS compliant security services, vessel inspections, cargo screening, and comprehensive maritime security assessments', 'SGSIN', 240.00, 4),
        ('Singapore Advanced Cargo Operations', 'cargo_handling', 'Cutting-edge cargo handling with automated systems, AI optimization, multimodal connections, and real-time tracking', 'SGSIN', 380.00, 5),
        
        -- LOS ANGELES PORT (USLAX) - 5 services
        ('LA Heavy-Duty Tugboat Operations', 'tugboat', 'Powerful tugboat services for large container vessels, tankers, cruise ships, and emergency response in LA-Long Beach harbor complex', 'USLAX', 550.00, 1),
        ('LA Automated Cargo Terminal', 'cargo_handling', 'Advanced cargo handling with automated container cranes, on-dock rail facilities, and integrated truck gate systems', 'USLAX', 420.00, 2),
        ('LA Customs and Border Protection', 'customs_clearance', 'US Customs and Border Protection clearance services with expedited processing, C-TPAT benefits, and trade compliance', 'USLAX', 160.00, 3),
        ('LA Eco-Friendly Ship Cleaning', 'cleaning', 'Environmentally responsible ship cleaning with waste water treatment, biodegradable products, and California compliance', 'USLAX', 145.00, 4),
        ('LA Maritime Security Operations', 'security', 'Comprehensive port security services including vessel screening, cargo inspection, and TWIC-compliant personnel', 'USLAX', 210.00, 5),
        
        -- HAMBURG PORT (DEHAM) - 5 services
        ('Hamburg Premium Maintenance Facility', 'maintenance', 'Complete ship repair and maintenance facility with certified technicians, modern equipment, and specialized services', 'DEHAM', 620.00, 1),
        ('Hamburg Elbe River Tugboat Services', 'tugboat', 'Specialized tugboat fleet for Elbe river navigation, Hamburg port operations, and North Sea approaches', 'DEHAM', 460.00, 2),
        ('Hamburg Multi-Purpose Cargo Terminal', 'cargo_handling', 'Versatile cargo terminal with heavy lift capabilities, breakbulk handling, container operations, and project cargo expertise', 'DEHAM', 360.00, 3),
        ('Hamburg Premium Berthing Services', 'vessel_berthing', 'Secure berthing facilities for all vessel types with advanced mooring systems and comprehensive utility connections', 'DEHAM', 200.00, 4),
        ('Hamburg Waste Management Solutions', 'waste_disposal', 'Comprehensive waste collection and disposal services compliant with German environmental standards and EU regulations', 'DEHAM', 185.00, 5),
        
        -- ANTWERP PORT (BEANR) - 5 services
        ('Antwerp Scheldt River Pilotage', 'pilotage', 'Expert pilotage services for Scheldt river navigation, Antwerp port complex entry, and coordination with Dutch authorities', 'BEANR', 390.00, 1),
        ('Antwerp Chemical Cargo Specialists', 'cargo_handling', 'Specialized handling of chemical and petrochemical cargo with certified safety protocols and emergency response capabilities', 'BEANR', 450.00, 2),
        ('Antwerp Strategic Marine Fuel Terminal', 'bunkering', 'Strategic bunkering location with all fuel types, quality control laboratory, and efficient delivery to vessel systems', 'BEANR', 750.00, 3),
        ('Antwerp Ship Maintenance Cluster', 'maintenance', 'Comprehensive ship repair services with specialized facilities for chemical tankers and gas carriers', 'BEANR', 540.00, 4),
        ('Antwerp Vessel Cleaning Specialists', 'cleaning', 'Professional vessel cleaning with expertise in chemical tank cleaning, decontamination, and specialized coating services', 'BEANR', 165.00, 5)
    ) AS services(service_name, service_type, service_description, port_code, price_per_hour, provider_preference)
)
INSERT INTO public.services (id, name, type, description, port_id, provider_id, price_per_hour, availability, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    cs.service_name,
    cs.service_type::service_type,
    cs.service_description,
    pd.port_id,
    -- Assign providers in round-robin fashion based on preference
    COALESCE(
        (SELECT provider_id FROM provider_data WHERE provider_rank = ((cs.provider_preference - 1) % (SELECT COUNT(*) FROM provider_data)) + 1),
        (SELECT provider_id FROM provider_data ORDER BY random() LIMIT 1)
    ),
    cs.price_per_hour,
    true,
    NOW(),
    NOW()
FROM comprehensive_services cs
JOIN port_data pd ON pd.code = cs.port_code
WHERE EXISTS (SELECT 1 FROM provider_data) -- Only insert if providers exist
  AND NOT EXISTS (
    SELECT 1 FROM public.services
    WHERE name = cs.service_name
  ); -- Avoid duplicates without using ON CONFLICT

-- Insert additional services for remaining ports to reach 30+ services
WITH port_data AS (
    SELECT id as port_id, code, name as port_name
    FROM public.ports
    WHERE code IN ('CNSHA', 'AEJEA')
),
provider_data AS (
    SELECT id as provider_id, email, name as provider_name,
           ROW_NUMBER() OVER (ORDER BY created_at) as provider_rank
    FROM public.users
    WHERE role = 'provider'
),
additional_services AS (
    SELECT * FROM (VALUES
        -- SHANGHAI PORT (CNSHA) - 5 services
        ('Shanghai Yangtze River Tugboat Fleet', 'tugboat', 'Powerful tugboat services for Yangtze river navigation, Shanghai port operations, and deep-water channel assistance', 'CNSHA', 480.00, 1),
        ('Shanghai Mega Container Terminal', 'cargo_handling', 'World-largest automated container terminal with deep-water berths, intelligent systems, and multimodal connectivity', 'CNSHA', 320.00, 2),
        ('Shanghai Customs Clearance Hub', 'customs_clearance', 'Chinese customs clearance services with bonded warehouse facilities, free trade zone benefits, and trade facilitation', 'CNSHA', 140.00, 3),
        ('Shanghai Port Security Division', 'security', 'Advanced port security with biometric systems, cargo scanning technology, and comprehensive maritime patrol services', 'CNSHA', 190.00, 4),
        ('Shanghai Waste Treatment Center', 'waste_disposal', 'Modern waste processing facility handling all types of ship-generated waste, recyclables, and hazardous materials', 'CNSHA', 155.00, 5),

        -- DUBAI PORT (AEJEA) - 5 services
        ('Dubai Premium Tugboat Services', 'tugboat', 'High-performance tugboat fleet serving Dubai ports, offshore operations, and emergency response in the Arabian Gulf', 'AEJEA', 500.00, 1),
        ('Dubai Jebel Ali Cargo Hub', 'cargo_handling', 'Strategic cargo handling facility connecting Asia, Europe, and Africa with modern equipment and free zone benefits', 'AEJEA', 400.00, 2),
        ('Dubai Marine Services Center', 'maintenance', 'State-of-the-art ship repair facility with floating dry dock, specialized marine services, and 24/7 emergency response', 'AEJEA', 650.00, 3),
        ('Dubai Secure Berthing Complex', 'vessel_berthing', 'Premium berthing facilities with advanced security systems, VIP vessel services, and luxury amenities', 'AEJEA', 280.00, 4),
        ('Dubai Customs Free Zone Services', 'customs_clearance', 'UAE customs clearance with free zone benefits, expedited processing, and comprehensive trade facilitation', 'AEJEA', 120.00, 5)
    ) AS services(service_name, service_type, service_description, port_code, price_per_hour, provider_preference)
)
INSERT INTO public.services (id, name, type, description, port_id, provider_id, price_per_hour, availability, created_at, updated_at)
SELECT
    gen_random_uuid(),
    ads.service_name,
    ads.service_type::service_type,
    ads.service_description,
    pd.port_id,
    -- Assign providers in round-robin fashion
    COALESCE(
        (SELECT provider_id FROM provider_data WHERE provider_rank = ((ads.provider_preference - 1) % (SELECT COUNT(*) FROM provider_data)) + 1),
        (SELECT provider_id FROM provider_data ORDER BY random() LIMIT 1)
    ),
    ads.price_per_hour,
    true,
    NOW(),
    NOW()
FROM additional_services ads
JOIN port_data pd ON pd.code = ads.port_code
WHERE EXISTS (SELECT 1 FROM provider_data)
  AND NOT EXISTS (
    SELECT 1 FROM public.services
    WHERE name = ads.service_name
  ); -- Avoid duplicates without using ON CONFLICT

-- =====================================================
-- VERIFICATION AND SUMMARY QUERIES
-- =====================================================

-- Overall summary
SELECT
    '🎉 SERVICES POPULATION SUMMARY' as report_section,
    COUNT(*) as total_services_created,
    COUNT(DISTINCT type) as service_types_covered,
    COUNT(DISTINCT port_id) as ports_with_services,
    COUNT(DISTINCT provider_id) as providers_with_services,
    ROUND(AVG(price_per_hour), 2) as average_price_per_hour,
    MIN(price_per_hour) as lowest_price,
    MAX(price_per_hour) as highest_price
FROM public.services;

-- Service type distribution with pricing analysis
SELECT
    '📊 SERVICE TYPE ANALYSIS' as report_section,
    type as service_type,
    COUNT(*) as service_count,
    ROUND(AVG(price_per_hour), 2) as avg_price_usd,
    MIN(price_per_hour) as min_price_usd,
    MAX(price_per_hour) as max_price_usd,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.services), 1) as percentage_of_total
FROM public.services
GROUP BY type
ORDER BY avg_price_usd DESC;

-- Port distribution analysis
SELECT
    '🌍 PORT DISTRIBUTION ANALYSIS' as report_section,
    p.name as port_name,
    p.code as port_code,
    p.location as port_location,
    COUNT(s.id) as services_available,
    ROUND(AVG(s.price_per_hour), 2) as avg_service_price,
    STRING_AGG(DISTINCT s.type::text, ', ' ORDER BY s.type::text) as available_service_types
FROM public.ports p
LEFT JOIN public.services s ON p.id = s.port_id
WHERE p.code IN ('BRSSZ', 'NLRTM', 'SGSIN', 'USLAX', 'DEHAM', 'BEANR', 'CNSHA', 'AEJEA')
GROUP BY p.id, p.name, p.code, p.location
ORDER BY services_available DESC;

-- Provider workload distribution
SELECT
    '👥 PROVIDER WORKLOAD ANALYSIS' as report_section,
    u.name as provider_name,
    u.company as company_name,
    u.email as contact_email,
    COUNT(s.id) as services_managed,
    ROUND(AVG(s.price_per_hour), 2) as avg_service_price,
    STRING_AGG(DISTINCT s.type::text, ', ' ORDER BY s.type::text) as service_specializations
FROM public.users u
LEFT JOIN public.services s ON u.id = s.provider_id
WHERE u.role = 'provider'
GROUP BY u.id, u.name, u.company, u.email
ORDER BY services_managed DESC;

-- Final status and recommendations
SELECT
    '✅ POPULATION STATUS' as report_section,
    CASE
        WHEN COUNT(*) >= 30 THEN '🎯 EXCELLENT: Comprehensive service coverage achieved'
        WHEN COUNT(*) >= 20 THEN '✅ GOOD: Solid service coverage, consider adding more specialized services'
        WHEN COUNT(*) >= 10 THEN '⚠️  MODERATE: Basic coverage achieved, recommend adding more services'
        ELSE '❌ INSUFFICIENT: Need more service providers and services'
    END as status_assessment,
    COUNT(*) as total_services,
    CASE
        WHEN COUNT(DISTINCT type) = 10 THEN '✅ All 10 service types covered'
        ELSE CONCAT('⚠️  Only ', COUNT(DISTINCT type), ' of 10 service types covered')
    END as service_type_coverage,
    CASE
        WHEN COUNT(DISTINCT port_id) >= 6 THEN '✅ Good port distribution'
        ELSE '⚠️  Limited port coverage'
    END as port_coverage_status
FROM public.services;

-- Missing service types (if any)
WITH all_service_types AS (
    SELECT unnest(enum_range(NULL::service_type)) as service_type
),
covered_types AS (
    SELECT DISTINCT type as service_type FROM public.services
)
SELECT
    '🔍 MISSING SERVICE TYPES' as report_section,
    ast.service_type as missing_service_type,
    'Consider adding this service type to improve coverage' as recommendation
FROM all_service_types ast
LEFT JOIN covered_types ct ON ast.service_type = ct.service_type
WHERE ct.service_type IS NULL;
