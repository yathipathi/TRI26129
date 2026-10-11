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

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const { siteId } = await params;
    const userId = getAuthenticatedUserId(req);

    if (siteId === 'demo') {
      ensureDemoProject();
    }

    let fileData = getSiteFile(siteId, 'index.html');
    if (!fileData && siteId === 'demo') {
      ensureDemoProject();
      fileData = getSiteFile(siteId, 'index.html');
    }

    if (!fileData) {
      return new NextResponse('404 Not Found - Site files not found on disk', { status: 404 });
    }

    // Row-Level Security check if project is registered in DB
    if (userId) {
      const project = getProjectById(siteId, userId);
      // If project is registered under another user, deny access
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
