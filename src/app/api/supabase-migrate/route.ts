import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supabaseUrl, supabaseServiceKey, sql } = body;

    if (!supabaseUrl || !supabaseServiceKey || !sql) {
      return NextResponse.json(
        { error: 'supabaseUrl, supabaseServiceKey, and sql are required.' },
        { status: 400 }
      );
    }

    // Extract project ref from URL: https://{ref}.supabase.co
    const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (!urlMatch) {
      return NextResponse.json({ error: 'Invalid Supabase URL format. Expected https://<project-ref>.supabase.co' }, { status: 400 });
    }
    const projectRef = urlMatch[1];

    // Execute SQL via Supabase Management API
    const mgmtRes = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      }
    );

    if (!mgmtRes.ok) {
      const errText = await mgmtRes.text();
      return NextResponse.json(
        { error: `Supabase Management API error: ${errText}` },
        { status: mgmtRes.status }
      );
    }

    const result = await mgmtRes.json();
    return NextResponse.json({
      success: true,
      message: 'SQL migration executed successfully on Supabase PostgreSQL.',
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Migration failed.' },
      { status: 500 }
    );
  }
}
