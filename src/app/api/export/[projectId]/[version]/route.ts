import { NextRequest, NextResponse } from 'next/server';
import { getSiteMeta, getSiteFile } from '@/lib/storage';
import JSZip from 'jszip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ projectId: string; version: string }> }) {
  try {
    const { projectId, version } = await params;
    const meta = getSiteMeta(projectId);

    if (!meta) {
      return NextResponse.json({ error: `Project ${projectId} not found` }, { status: 404 });
    }

    const zip = new JSZip();
    for (const fileName of meta.files) {
      const fileData = getSiteFile(projectId, fileName);
      if (fileData) {
        zip.file(fileName, fileData.content);
      }
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${projectId}-v${version}.zip"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Export failed' }, { status: 500 });
  }
}
