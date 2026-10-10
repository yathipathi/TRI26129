import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { getKnowledgeSourceById, saveKnowledgeSource, deleteKnowledgeSource } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const source = getKnowledgeSourceById(params.id, userId);
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

    return NextResponse.json({ source });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch source' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const source = getKnowledgeSourceById(params.id, userId);
    if (!source) return NextResponse.json({ error: 'Source not found' }, { status: 404 });

    const body = await req.json();
    const { title, tags, description, projectId } = body;

    if (title !== undefined) source.title = title;
    if (tags !== undefined && Array.isArray(tags)) source.tags = tags;
    if (description !== undefined) source.description = description;
    if (projectId !== undefined) source.projectId = projectId;
    source.updatedAt = Date.now();

    saveKnowledgeSource(source);

    return NextResponse.json({ success: true, source });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update source' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deleted = deleteKnowledgeSource(params.id, userId);
    if (!deleted) return NextResponse.json({ error: 'Source not found or unauthorized' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete source' }, { status: 500 });
  }
}
