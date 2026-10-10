import { NextRequest, NextResponse } from 'next/server';
import { getSiteFile } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string; file: string[] }> }) {
  try {
    const { siteId, file } = await params;
    const filePath = (file || []).join('/');
    const fileData = getSiteFile(siteId, filePath);

    if (!fileData) {
      return new NextResponse(`File ${filePath} not found`, { status: 404 });
    }

    return new NextResponse(fileData.content, {
      status: 200,
      headers: {
        'Content-Type': fileData.mimeType,
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (err: any) {
    return new NextResponse('Error serving file preview', { status: 500 });
  }
}
