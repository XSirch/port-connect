import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with proper configuration
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  },
  global: {
    headers: {
      'X-Client-Info': 'portconnect-web'
    }
  }
})

// Enum types
export type ServiceType = 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance' | 'docking'
export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type UserRole = 'captain' | 'provider' | 'terminal'

// Database types - using the generated types with custom overrides
export type User = Database['public']['Tables']['users']['Row'] & {
  role: UserRole
}
export type Port = Database['public']['Tables']['ports']['Row']
export type Service = Database['public']['Tables']['services']['Row'] & {
  type: ServiceType
}
export type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  status: ReservationStatus
  terminal_approval?: ApprovalStatus
  provider_approval?: ApprovalStatus
  terminal_notes?: string
  terminal_approved_at?: string
  provider_approved_at?: string
  terminal_approved_by?: string
  provider_approved_by?: string
}

// Insert types for creating new records
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PortInsert = Database['public']['Tables']['ports']['Insert']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ReservationInsert = Database['public']['Tables']['reservations']['Insert']

// Update types for updating records
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PortUpdate = Database['public']['Tables']['ports']['Update']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']
export type ReservationUpdate = Database['public']['Tables']['reservations']['Update']
