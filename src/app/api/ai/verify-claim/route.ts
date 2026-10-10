import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { verifyClaimAgainstSources } from '@/lib/rag';

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
    const { claimText, projectId } = body;

    if (!claimText || typeof claimText !== 'string') {
      return NextResponse.json({ error: 'claimText is required for verification' }, { status: 400 });
    }

    const report = await verifyClaimAgainstSources(userId, claimText, projectId);

    return NextResponse.json({
      claimText,
      report,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Claim verification failed' }, { status: 500 });
  }
}
