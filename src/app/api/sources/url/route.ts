import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { processIngestion } from '@/lib/ingestion-pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { url, title, projectId } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const source = await processIngestion({
      userId,
      projectId,
      title: title || url,
      type: 'url',
      url,
    });

    return NextResponse.json({ success: true, source }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'URL ingestion failed' }, { status: 500 });
  }
}
