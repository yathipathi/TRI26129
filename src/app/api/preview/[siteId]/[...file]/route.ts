import { NextRequest, NextResponse } from 'next/server';
import { getSiteFile } from '@/lib/storage';
import { getProjectById } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { ensureDemoProject } from '@/lib/db';

function getAuthenticatedUserId(req: NextRequest): string {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || 'usr-default';
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string; file: string[] }> }) {
  try {
    const { siteId, file } = await params;
    const userId = getAuthenticatedUserId(req);

    if (siteId === 'demo') {
      ensureDemoProject();
    }

    const filePath = (file || []).join('/');
    const fileData = getSiteFile(siteId, filePath);

    if (!fileData) {
      return new NextResponse(`404 Not Found - File ${filePath} not found`, { status: 404 });
    }

    if (userId) {
      const project = getProjectById(siteId, userId);
      if (project && project.userId !== userId && project.userId !== 'usr-default' && userId !== 'usr-default') {
        return new NextResponse('404 Not Found - Access denied', { status: 404 });
      }
    }

    return new NextResponse(fileData.content, {
      status: 200,
      headers: {
        'Content-Type': fileData.mimeType,
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch {
    return new NextResponse('404 Not Found', { status: 404 });
  }
}
