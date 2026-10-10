import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { retrieveRelevantChunks } from '@/lib/rag';

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
    const { query, projectId, topK } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const results = retrieveRelevantChunks(userId, query, projectId, topK || 5);

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Retrieval failed' }, { status: 500 });
  }
}
