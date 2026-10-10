import { NextRequest, NextResponse } from 'next/server';
import { 
  getProjectById, getVersionsForProject, getSubmissionsForProject, 
  getVerificationReport, getSecurityReport, renameProject, duplicateProject, deleteProject 
} from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const versions = getVersionsForProject(id);
    const submissions = getSubmissionsForProject(id);

    const latestVersion = versions[0];
    const verificationReport = latestVersion ? getVerificationReport(latestVersion.id) : null;
    const securityReport = latestVersion ? getSecurityReport(latestVersion.id) : null;

    return NextResponse.json({
      project,
      versions,
      submissions,
      verificationReport,
      securityReport,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch project' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (body.name) {
      const updated = renameProject(id, userId, body.name);
      if (!updated) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      return NextResponse.json({ success: true, project: updated });
    }

    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Rename failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const duplicated = duplicateProject(id, userId);
    if (!duplicated) return NextResponse.json({ error: 'Failed to duplicate project' }, { status: 404 });

    return NextResponse.json({ success: true, project: duplicated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Duplicate failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const deleted = deleteProject(id, userId);
    if (!deleted) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Delete failed' }, { status: 500 });
  }
}
