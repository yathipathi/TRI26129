import { WebsiteProject } from '@/types';

export function generateCustomHooks(project: WebsiteProject): string {
  const hasAuth = project.sections.some(s => s.type === 'auth');
  const hasContact = project.sections.some(s => s.type === 'contact');
  const hasDashboard = project.sections.some(s => s.type === 'dashboard');

  const baseHook = `// Generated Production Custom Hooks with Supabase Real-Time Subscriptions
// Project: ${project.title}
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null;
  const key = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function useSupabaseTable<T = Record<string, unknown>>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const client = getClient();
    if (!client) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data: rows, error: err } = await client
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setData((rows ?? []) as T[]);
    }
    setLoading(false);
  }, [tableName]);

  useEffect(() => {
    fetchData();
    const client = getClient();
    if (!client) return;
    const channel = client
      .channel('realtime-' + tableName)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, () => {
        fetchData();
      })
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [fetchData, tableName]);

  return { data, loading, error, refetch: fetchData };
}
`;

  const profilesHook = `
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export function useProfiles() {
  return useSupabaseTable<Profile>('profiles');
}
`;

  const inquiriesHook = hasContact ? `
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  created_at: string;
}

export function useInquiries() {
  return useSupabaseTable<Inquiry>('inquiries');
}

export async function submitInquiry(data: Omit<Inquiry, 'id' | 'status' | 'created_at'>) {
  const client = getClient();
  if (!client) {
    console.warn('[Supabase] Client not configured. Mocking inquiry submission.');
    return { success: true, mocked: true };
  }
  const { error } = await client.from('inquiries').insert([{ ...data, status: 'pending' }]);
  if (error) throw new Error(error.message);
  return { success: true };
}
` : '';

  const analyticsHook = hasDashboard ? `
export interface AnalyticsEvent {
  id: string;
  event_name: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export function useAnalyticsEvents() {
  return useSupabaseTable<AnalyticsEvent>('analytics_events');
}

export async function trackEvent(eventName: string, metadata?: Record<string, unknown>) {
  const client = getClient();
  if (!client) return;
  await client.from('analytics_events').insert([{ event_name: eventName, metadata: metadata ?? {} }]);
}
` : '';

  const authHook = hasAuth ? `
export function useSupabaseAuth() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = getClient();
    if (!client) {
      setLoading(false);
      return;
    }
    client.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const client = getClient();
    if (!client) throw new Error('Supabase credentials not configured in settings.');
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    const client = getClient();
    if (!client) return;
    await client.auth.signOut();
  };

  return { user, loading, signIn, signOut };
}
` : '';

  return baseHook + profilesHook + inquiriesHook + analyticsHook + authHook;
}
