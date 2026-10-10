'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  
  const url = localStorage.getItem('supabase_url') || '';
  const key = localStorage.getItem('supabase_anon_key') || '';
  
  if (!url || !key) return null;
  
  if (!_supabaseInstance) {
    _supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  
  return _supabaseInstance;
}

export function resetSupabaseClient() {
  _supabaseInstance = null;
}

export type { SupabaseClient };
