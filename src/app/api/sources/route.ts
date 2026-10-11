import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeSources, getUserQuota } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { processIngestion } from '@/lib/ingestion-pipeline';
import { SourceFileType } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || 'usr-default';
}

export async function GET(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId') || undefined;

    const sources = getKnowledgeSources(userId, projectId);
    const quota = getUserQuota(userId);

    return NextResponse.json({
      sources,
      quota,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch sources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const title = formData.get('title') as string || undefined;
      const projectId = formData.get('projectId') as string || undefined;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split('.').pop()?.toLowerCase() || 'txt';
      const fileTypeMap: Record<string, SourceFileType> = {
        pdf: 'pdf', docx: 'docx', txt: 'txt', md: 'md', html: 'html', pptx: 'pptx', png: 'image', jpg: 'image', jpeg: 'image'
      };
      const type: SourceFileType = fileTypeMap[ext] || 'txt';

      const source = await processIngestion({
        userId,
        projectId,
        title: title || file.name,
        type,
        fileBuffer,
        filename: file.name,
      });

      return NextResponse.json({ success: true, source }, { status: 201 });
    }

    // JSON text ingestion
    const body = await req.json();
    const { title, pastedText, type, projectId } = body;

    if (!pastedText || !pastedText.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const source = await processIngestion({
      userId,
      projectId,
      title: title || 'Pasted Research Note',
      type: (type as SourceFileType) || 'text',
      pastedText,
    });

    return NextResponse.json({ success: true, source }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Ingestion failed' }, { status: 500 });
  }
}
