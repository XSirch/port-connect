import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Database types - using the generated types
export type User = Database['public']['Tables']['users']['Row']
export type Port = Database['public']['Tables']['ports']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']

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
