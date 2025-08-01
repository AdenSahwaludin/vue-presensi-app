import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          role: 'admin' | 'employee'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          role?: 'admin' | 'employee'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          role?: 'admin' | 'employee'
          created_at?: string
          updated_at?: string
        }
      }
      presensi: {
        Row: {
          id: string
          user_id: string
          date: string
          check_in_time: string | null
          check_in_location: { lat: number; lng: number } | null
          check_in_photo: string | null
          check_out_time: string | null
          check_out_location: { lat: number; lng: number } | null
          check_out_photo: string | null
          status: 'present' | 'late' | 'absent'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          check_in_time?: string | null
          check_in_location?: { lat: number; lng: number } | null
          check_in_photo?: string | null
          check_out_time?: string | null
          check_out_location?: { lat: number; lng: number } | null
          check_out_photo?: string | null
          status?: 'present' | 'late' | 'absent'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          check_in_time?: string | null
          check_in_location?: { lat: number; lng: number } | null
          check_in_photo?: string | null
          check_out_time?: string | null
          check_out_location?: { lat: number; lng: number } | null
          check_out_photo?: string | null
          status?: 'present' | 'late' | 'absent'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
