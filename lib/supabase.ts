import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key, {
  auth: {
    // Session in localStorage speichern (Standard, aber explizit setzen)
    persistSession: true,
    // Automatisches Token-Refresh aktivieren
    autoRefreshToken: true,
    // Auf Auth-State-Changes in anderen Tabs reagieren
    detectSessionInUrl: true,
  },
})
