import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, getVersionsForProject, saveVersion } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { Version } from '@/types';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

// GET all versions for a project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const versions = getVersionsForProject(id);

    return NextResponse.json({
      success: true,
      versions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch versions' }, { status: 500 });
  }
}

// POST create manual or automatic version checkpoint
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { label, changelog, spec, createdBy } = await req.json();

    const existingVersions = getVersionsForProject(id);
    const nextVersionNum = existingVersions.length > 0 ? Math.max(...existingVersions.map((v) => v.versionNumber)) + 1 : 1;

    const newVersion: Version = {
      id: 'ver-' + crypto.randomUUID().substring(0, 8),
      projectId: id,
      versionNumber: nextVersionNum,
      label: label || `Version ${nextVersionNum}`,
      changelog: changelog || 'Manual checkpoint save',
      siteSpec: spec || project.siteSpec,
      spec: spec || project.siteSpec,
      createdAt: Date.now(),
    };

    saveVersion(newVersion);

    return NextResponse.json({
      success: true,
      version: newVersion,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create version checkpoint' }, { status: 500 });
  }
}
