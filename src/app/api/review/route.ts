import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getProjectById, ensureDbFile, saveDb } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

// Generate shareable read-only tokenized preview link
export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { projectId } = await req.json();

    const project = getProjectById(projectId, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const token = 'rev-' + crypto.randomUUID().substring(0, 12);
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    const db: any = ensureDbFile();
    if (!db.reviewTokens) db.reviewTokens = [];

    db.reviewTokens.push({
      token,
      projectId,
      userId,
      createdAt: Date.now(),
      expiresAt,
    });

    saveDb(db);

    return NextResponse.json({
      success: true,
      token,
      shareableUrl: `/review/${token}`,
      expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create review link' }, { status: 500 });
  }
}

// Get or add reviewer comments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) return NextResponse.json({ error: 'Review token required' }, { status: 400 });

    const db: any = ensureDbFile();
    const tokenRecord = (db.reviewTokens || []).find((t: any) => t.token === token);

    if (!tokenRecord || Date.now() > tokenRecord.expiresAt) {
      return NextResponse.json({ error: 'Review link expired or invalid' }, { status: 403 });
    }

    const project = getProjectById(tokenRecord.projectId);
    const comments = (db.reviewComments || []).filter((c: any) => c.projectId === tokenRecord.projectId);

    return NextResponse.json({
      success: true,
      project: {
        id: project?.id,
        name: project?.name,
        siteSpec: project?.siteSpec,
      },
      comments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch review data' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { token, sectionId, author, text, commentId, action } = await req.json();

    const db: any = ensureDbFile();
    if (!db.reviewComments) db.reviewComments = [];

    if (action === 'resolve' && commentId) {
      const target = db.reviewComments.find((c: any) => c.id === commentId);
      if (target) target.status = 'resolved';
      saveDb(db);
      return NextResponse.json({ success: true });
    }

    const tokenRecord = (db.reviewTokens || []).find((t: any) => t.token === token);
    if (!tokenRecord || Date.now() > tokenRecord.expiresAt) {
      return NextResponse.json({ error: 'Review link expired or invalid' }, { status: 403 });
    }

    const newComment = {
      id: 'cmt-' + crypto.randomUUID().substring(0, 8),
      projectId: tokenRecord.projectId,
      sectionId,
      author: author || 'Guest Reviewer',
      text,
      status: 'open',
      createdAt: Date.now(),
    };

    db.reviewComments.push(newComment);
    saveDb(db);

    return NextResponse.json({ success: true, comment: newComment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process comment' }, { status: 500 });
  }
}
