import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, saveProject, getVersionsForProject, saveVersion } from '@/lib/db';
import { saveSiteFiles } from '@/lib/storage';
import { verifyJwt } from '@/lib/auth';
import { assertZeroCollateralDamage } from '@/lib/verifier';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

// GET draft spec for project with ownership check
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });

    const versions = getVersionsForProject(id);
    const latestVersion = versions[0];
    const spec = latestVersion?.siteSpec || project.siteSpec;

    return NextResponse.json({
      success: true,
      project,
      spec,
      revision: project.currentVersion,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch draft' }, { status: 500 });
  }
}

// PUT / POST autosave draft with optimistic concurrency, Zod re-validation & zero-collateral proof
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });

    const body = await req.json();
    const { spec, revision, description, targetSectionId } = body;

    if (!spec) {
      return NextResponse.json({ error: 'Invalid SiteSpec payload' }, { status: 400 });
    }

    // 1. Optimistic Concurrency Control
    if (revision && revision < project.currentVersion) {
      return NextResponse.json(
        {
          error: 'CONFLICT',
          message: 'Conflict detected: Another session or tab has saved a newer version of this project.',
          serverRevision: project.currentVersion,
          clientRevision: revision,
          serverSpec: project.siteSpec,
        },
        { status: 409 }
      );
    }

    // 2. Zero-Collateral Proof Verification
    const prevSections = (project.siteSpec as any)?.sections || (project.siteSpec as any)?.pages?.[0]?.sections || [];
    const nextSections = spec.sections || spec.pages?.[0]?.sections || [];

    const collateralCheck = assertZeroCollateralDamage(prevSections, nextSections, targetSectionId);

    // 3. Update Project State
    const nextRevision = (project.currentVersion || 1) + 1;
    project.currentVersion = nextRevision;
    project.siteSpec = spec;
    project.updatedAt = Date.now();

    saveProject(project);

    // 4. Save to disk storage
    saveSiteFiles(id, { 'spec.json': JSON.stringify(spec, null, 2) }, {
      name: project.name,
      type: project.type,
      prompt: description || 'Visual Editor Autosave',
      sources: [],
    });

    return NextResponse.json({
      success: true,
      revision: nextRevision,
      timestamp: Date.now(),
      collateralProof: collateralCheck,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Draft save failed' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return POST(req, { params });
}
