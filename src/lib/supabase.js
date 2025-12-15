import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iglgrggtrozuhiszxyws.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGdyZ2d0cm96dWhpc3p4eXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3Mzg0NDYsImV4cCI6MjA4MTMxNDQ0Nn0._OS__a9Hhm6okX7j-3K1PHqNB2DwzuAL0_mZE9X5rvs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
