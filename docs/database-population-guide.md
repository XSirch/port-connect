# Database Population Guide - Step by Step

This guide provides a step-by-step approach to populate the PortConnect database with sample data, avoiding foreign key constraint errors.

## The Issue

The error you encountered happens because:
1. The `public.users` table has a foreign key constraint to `auth.users`
2. We can't directly insert into `public.users` without first creating authentication records
3. Supabase's Row Level Security (RLS) prevents direct manipulation of auth tables

## Solution: Manual Step-by-Step Process

### Step 1: Run the Fixed SQL Script

First, run the `populate-database-fixed.sql` script in your Supabase SQL Editor. This will:
- Add the new service types to the enum
- Insert the sample ports (which don't have auth constraints)

```sql
-- Copy and paste the content from scripts/populate-database-fixed.sql
```

### Step 2: Create Authentication Users

You need to create users through Supabase's authentication system. You can do this in two ways:

#### Option A: Through Supabase Dashboard
1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add user"
3. Create users with these emails:

**Service Providers:**
- `santos.tugboat@demo.com`
- `rotterdam.cargo@demo.com`
- `singapore.pilot@demo.com`
- `la.bunkering@demo.com`
- `hamburg.maintenance@demo.com`

**Terminal Operators:**
- `terminal.santos@demo.com`
- `terminal.rotterdam@demo.com`

**Ship Captains:**
- `captain.smith@demo.com`
- `captain.rodriguez@demo.com`
- `captain.chen@demo.com`

#### Option B: Through the Application
1. Use the registration form in your application
2. Create accounts with the emails listed above
3. Use temporary passwords (users can change them later)

### Step 3: Update User Profiles

After creating the auth users, run these UPDATE statements in the SQL Editor:

```sql
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
```

### Step 4: Create Sample Services

Now you can create services either through the application interface or via SQL:

```sql
-- Insert sample services (run after users are created)
INSERT INTO public.services (name, type, description, port_id, provider_id, price_per_hour, availability) 
SELECT 
    'Santos Tugboat Assistance',
    'tugboat'::service_type,
    'Professional tugboat services for vessel maneuvering in Santos port waters',
    p.id,
    u.id,
    450.00,
    true
FROM public.ports p, public.users u 
WHERE p.code = 'BRSSZ' AND u.email = 'santos.tugboat@demo.com';

INSERT INTO public.services (name, type, description, port_id, provider_id, price_per_hour, availability) 
SELECT 
    'Rotterdam Cargo Handling',
    'cargo_handling'::service_type,
    'Complete cargo loading and unloading services with modern equipment',
    p.id,
    u.id,
    320.00,
    true
FROM public.ports p, public.users u 
WHERE p.code = 'NLRTM' AND u.email = 'rotterdam.cargo@demo.com';

INSERT INTO public.services (name, type, description, port_id, provider_id, price_per_hour, availability) 
SELECT 
    'Singapore Pilotage',
    'pilotage'::service_type,
    'Mandatory pilotage services for vessels entering Singapore waters',
    p.id,
    u.id,
    420.00,
    true
FROM public.ports p, public.users u 
WHERE p.code = 'SGSIN' AND u.email = 'singapore.pilot@demo.com';

INSERT INTO public.services (name, type, description, port_id, provider_id, price_per_hour, availability) 
SELECT 
    'LA Bunkering Service',
    'bunkering'::service_type,
    'Marine fuel supply including MGO, HFO, and LSFO with quality certificates',
    p.id,
    u.id,
    850.00,
    true
FROM public.ports p, public.users u 
WHERE p.code = 'USLAX' AND u.email = 'la.bunkering@demo.com';

INSERT INTO public.services (name, type, description, port_id, provider_id, price_per_hour, availability) 
SELECT 
    'Hamburg Ship Maintenance',
    'maintenance'::service_type,
    'Complete ship repair facility with certified technicians',
    p.id,
    u.id,
    580.00,
    true
FROM public.ports p, public.users u 
WHERE p.code = 'DEHAM' AND u.email = 'hamburg.maintenance@demo.com';
```

### Step 5: Verify the Data

Check that everything was inserted correctly:

```sql
-- Check ports
SELECT COUNT(*) as port_count FROM public.ports;

-- Check users by role
SELECT role, COUNT(*) as user_count 
FROM public.users 
GROUP BY role;

-- Check services
SELECT s.name, s.type, p.name as port_name, u.name as provider_name
FROM public.services s
JOIN public.ports p ON s.port_id = p.id
JOIN public.users u ON s.provider_id = u.id;
```

## Alternative: Simplified Approach

If you want to test the application quickly with minimal data:

1. Create just one user of each type through the app registration
2. Manually create 2-3 services through the Service Management interface
3. Test the booking functionality

This approach avoids SQL complexity and tests the full user workflow.

## Troubleshooting

### Foreign Key Constraint Errors
- Always create auth users first before updating public.users
- Verify users exist in auth.users before referencing them

### RLS Policy Errors
- Make sure you're logged in as the correct user type
- Check that user roles are set correctly
- Verify RLS policies allow the operation

### Service Type Errors
- Ensure the enum was updated with new service types
- Restart your application after database schema changes
- Check TypeScript types are updated

## Next Steps

After populating the database:
1. Test user authentication with different roles
2. Create and manage services as a provider
3. Book services as a captain
4. Verify the Bolt badge appears correctly
5. Test the responsive design on different devices
