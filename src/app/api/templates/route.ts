import { NextResponse } from 'next/server';
import { getAllTemplates } from '@/lib/templates';

export const runtime = 'nodejs';

export async function GET() {
  const templates = getAllTemplates();
  return NextResponse.json(templates, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
