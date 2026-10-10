'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  let url = '';
  let key = '';
  try {
    url = localStorage.getItem('supabase_url') || '';
    key = localStorage.getItem('supabase_anon_key') || '';
  } catch {
    // Return null if localStorage access is blocked
    return null;
  }
  
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
