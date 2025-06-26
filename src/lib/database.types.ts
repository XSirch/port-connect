export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'terminal' | 'provider' | 'captain'
          company: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'terminal' | 'provider' | 'captain'
          company?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'terminal' | 'provider' | 'captain'
          company?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ports: {
        Row: {
          id: string
          name: string
          code: string
          location: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          location: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          location?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          name: string
          type: 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance'
          description: string | null
          port_id: string
          provider_id: string
          price_per_hour: number | null
          availability: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance'
          description?: string | null
          port_id: string
          provider_id: string
          price_per_hour?: number | null
          availability?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance'
          description?: string | null
          port_id?: string
          provider_id?: string
          price_per_hour?: number | null
          availability?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      reservations: {
        Row: {
          id: string
          service_id: string
          captain_id: string
          ship_name: string
          ship_imo: string | null
          requested_date: string
          requested_time: string
          duration_hours: number
          status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
          notes: string | null
          provider_notes: string | null
          total_cost: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          captain_id: string
          ship_name: string
          ship_imo?: string | null
          requested_date: string
          requested_time: string
          duration_hours?: number
          status?: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
          notes?: string | null
          provider_notes?: string | null
          total_cost?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          service_id?: string
          captain_id?: string
          ship_name?: string
          ship_imo?: string | null
          requested_date?: string
          requested_time?: string
          duration_hours?: number
          status?: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
          notes?: string | null
          provider_notes?: string | null
          total_cost?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'terminal' | 'provider' | 'captain'
      service_type: 'tugboat' | 'bunkering' | 'cleaning' | 'maintenance'
      reservation_status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
