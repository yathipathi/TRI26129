import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId');

  if (!siteId) {
    return NextResponse.json({ error: 'Missing siteId parameter' }, { status: 400 });
  }

  // Redirect to official download route which packages files and complete technical thesis documentation
  const downloadUrl = new URL(`/api/download/${siteId}`, req.url);
  return NextResponse.redirect(downloadUrl);
}
