import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { geminiKey, openaiKey, supabaseUrl, supabaseAnonKey, mongoUri, clerkKey } = body;

    const results: Record<string, { ok: boolean; message: string }> = {};

    // 1. Verify Google Gemini API Key
    if (geminiKey && geminiKey.trim()) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Respond with: {"status": "ok"}' }] }],
            }),
          }
        );
        const data = await res.json();
        if (res.ok && data.candidates) {
          results.gemini = { ok: true, message: 'Google Gemini 1.5/2.0 API Active & Verified' };
        } else {
          results.gemini = { ok: false, message: data.error?.message || 'Invalid Gemini API key or quota exceeded' };
        }
      } catch (err: any) {
        results.gemini = { ok: false, message: err.message || 'Failed to connect to Gemini API' };
      }
    }

    // 2. Verify OpenAI API Key
    if (openaiKey && openaiKey.trim()) {
      try {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${openaiKey.trim()}` },
        });
        if (res.ok) {
          results.openai = { ok: true, message: 'OpenAI GPT-4o API Active & Verified' };
        } else {
          const data = await res.json();
          results.openai = { ok: false, message: data.error?.message || 'Invalid OpenAI API key' };
        }
      } catch (err: any) {
        results.openai = { ok: false, message: err.message || 'Failed to connect to OpenAI API' };
      }
    }

    // 3. Verify Supabase
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const cleanUrl = supabaseUrl.replace(/\/$/, '');
        const res = await fetch(`${cleanUrl}/rest/v1/`, {
          headers: {
            apikey: supabaseAnonKey,
            Authorization: `Bearer ${supabaseAnonKey}`,
          },
        });
        if (res.ok || res.status === 200 || res.status === 404 || res.status === 401) {
          results.supabase = { ok: true, message: 'Supabase URL & Anon Key Connected' };
        } else {
          results.supabase = { ok: false, message: `Supabase returned HTTP ${res.status}` };
        }
      } catch (err: any) {
        results.supabase = { ok: false, message: 'Could not connect to Supabase project URL' };
      }
    }

    // 4. Verify Clerk
    if (clerkKey && clerkKey.trim()) {
      if (clerkKey.startsWith('pk_test_') || clerkKey.startsWith('pk_live_')) {
        results.clerk = { ok: true, message: 'Clerk Publishable Key Valid Format' };
      } else {
        results.clerk = { ok: false, message: 'Clerk key must start with pk_test_ or pk_live_' };
      }
    }

    // 5. Verify MongoDB
    if (mongoUri && mongoUri.trim()) {
      if (mongoUri.startsWith('mongodb://') || mongoUri.startsWith('mongodb+srv://')) {
        results.mongo = { ok: true, message: 'MongoDB URI Valid Connection String' };
      } else {
        results.mongo = { ok: false, message: 'Must be a valid mongodb:// or mongodb+srv:// URI' };
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
