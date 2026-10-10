import { NextRequest, NextResponse } from 'next/server';
import { runVerificationCrawler } from '@/lib/verifier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { siteId, versionId } = body;

    if (!siteId) {
      return NextResponse.json({ error: 'siteId is required' }, { status: 400 });
    }

    const report = await runVerificationCrawler(siteId, versionId);
    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Verification crawler failed' }, { status: 500 });
  }
}
