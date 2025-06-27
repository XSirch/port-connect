# Database Setup and Population Guide

This guide explains how to set up and populate the PortConnect database with sample data.

## Prerequisites

1. Supabase project set up and running
2. Environment variables configured in `.env` file
3. Database schema applied (from `supabase-schema.sql`)

## Database Schema Updates

The application now supports extended service types. To add the new service types to your database, run the following SQL in your Supabase SQL Editor:

```sql
-- Add new service types to the enum
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'cargo_handling';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'vessel_berthing';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'pilotage';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'customs_clearance';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'waste_disposal';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'security';
```

## Manual Data Population

Since Row Level Security (RLS) is enabled, you'll need to populate the database manually through the Supabase interface or by temporarily disabling RLS. Here's the recommended approach:

### Step 1: Insert Sample Ports

Go to your Supabase dashboard → Table Editor → ports table and insert:

```sql
INSERT INTO public.ports (name, code, location, timezone) VALUES
('Port of Santos', 'BRSSZ', 'Santos, São Paulo, Brazil', 'America/Sao_Paulo'),
('Port of Rotterdam', 'NLRTM', 'Rotterdam, Netherlands', 'Europe/Amsterdam'),
('Port of Singapore', 'SGSIN', 'Singapore', 'Asia/Singapore'),
('Port of Los Angeles', 'USLAX', 'Los Angeles, California, USA', 'America/Los_Angeles'),
('Port of Hamburg', 'DEHAM', 'Hamburg, Germany', 'Europe/Berlin');
```

### Step 2: Create Sample Users

You'll need to create users through the authentication system first, then update their profiles:

1. **Service Providers**: Create accounts with emails like:
   - `santos.tugboat@demo.com`
   - `rotterdam.cargo@demo.com`
   - `singapore.pilot@demo.com`
   - `la.bunkering@demo.com`
   - `hamburg.maintenance@demo.com`

2. **Terminal Operators**: Create accounts with emails like:
   - `terminal.santos@demo.com`
   - `terminal.rotterdam@demo.com`

3. **Ship Captains**: Create accounts with emails like:
   - `captain.smith@demo.com`
   - `captain.rodriguez@demo.com`

### Step 3: Update User Roles

After creating the accounts, update their roles in the users table:

```sql
-- Update service providers
UPDATE public.users SET role = 'provider', company = 'Santos Maritime Solutions' 
WHERE email = 'santos.tugboat@demo.com';

UPDATE public.users SET role = 'provider', company = 'Rotterdam Port Services BV' 
WHERE email = 'rotterdam.cargo@demo.com';

-- Update terminal operators
UPDATE public.users SET role = 'terminal', company = 'Santos Port Authority' 
WHERE email = 'terminal.santos@demo.com';

-- Update captains
UPDATE public.users SET role = 'captain', company = 'Maersk Line' 
WHERE email = 'captain.smith@demo.com';
```

### Step 4: Insert Sample Services

Once you have providers, insert services through the application interface or directly:

```sql
-- Example services (replace provider_id and port_id with actual UUIDs)
INSERT INTO public.services (name, type, description, port_id, provider_id, price_per_hour, availability) VALUES
('Santos Tugboat Assistance', 'tugboat', 'Professional tugboat services for vessel maneuvering', 
 (SELECT id FROM ports WHERE code = 'BRSSZ'), 
 (SELECT id FROM users WHERE email = 'santos.tugboat@demo.com'), 
 450.00, true),

('Rotterdam Cargo Handling', 'cargo_handling', 'Complete cargo loading and unloading services', 
 (SELECT id FROM ports WHERE code = 'NLRTM'), 
 (SELECT id FROM users WHERE email = 'rotterdam.cargo@demo.com'), 
 320.00, true),

('Singapore Pilotage', 'pilotage', 'Mandatory pilotage services for vessels entering Singapore waters', 
 (SELECT id FROM ports WHERE code = 'SGSIN'), 
 (SELECT id FROM users WHERE email = 'singapore.pilot@demo.com'), 
 420.00, true);
```

## Service Types Available

The application now supports the following service types:

- **tugboat**: Tugboat assistance services
- **bunkering**: Marine fuel supply services
- **cleaning**: Vessel cleaning services
- **maintenance**: Ship maintenance and repair
- **cargo_handling**: Cargo loading/unloading operations
- **vessel_berthing**: Berthing and mooring services
- **pilotage**: Navigation pilot services
- **customs_clearance**: Customs and documentation services
- **waste_disposal**: Waste collection and disposal
- **security**: Port security and inspection services

## Testing the Application

After populating the database:

1. **As a Service Provider**: Log in and create/manage services
2. **As a Ship Captain**: Browse and book services
3. **As a Terminal Operator**: Manage ports and oversee operations

## Troubleshooting

### RLS Policy Issues

If you encounter RLS policy errors:

1. Check that users are properly authenticated
2. Verify user roles are set correctly
3. Ensure the user has the right permissions for the operation

### Service Type Errors

If new service types don't appear:

1. Verify the enum was updated correctly
2. Check TypeScript types are updated
3. Restart the development server

### Database Connection Issues

1. Verify Supabase URL and keys in `.env`
2. Check network connectivity
3. Ensure Supabase project is active

## Production Deployment

For production deployment:

1. Use environment-specific database URLs
2. Set up proper backup procedures
3. Monitor database performance
4. Implement proper logging and error handling

## Support

For additional help:

1. Check Supabase documentation
2. Review application logs
3. Test with minimal data first
4. Verify all environment variables are set correctly
