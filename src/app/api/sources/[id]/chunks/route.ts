import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { getKnowledgeSourceById, getSourceChunks } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const source = getKnowledgeSourceById(params.id, userId);
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

    const chunks = getSourceChunks(params.id);

    return NextResponse.json({
      sourceId: source.id,
      title: source.title,
      totalChunks: chunks.length,
      chunks,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch chunks' }, { status: 500 });
  }
}
