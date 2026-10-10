import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, getVersionsForProject } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { v1Id, v2Id } = await req.json();

    const versions = getVersionsForProject(id);
    const v1 = versions.find((v) => v.id === v1Id || String(v.versionNumber) === String(v1Id));
    const v2 = versions.find((v) => v.id === v2Id || String(v.versionNumber) === String(v2Id));

    if (!v1 || !v2) {
      return NextResponse.json({ error: 'One or both versions not found' }, { status: 404 });
    }

    const spec1: any = v1.siteSpec || v1.spec;
    const spec2: any = v2.siteSpec || v2.spec;

    const sections1 = spec1.sections || spec1.pages?.[0]?.sections || [];
    const sections2 = spec2.sections || spec2.pages?.[0]?.sections || [];

    const fieldDiffs: { sectionId: string; sectionTitle: string; field: string; val1: any; val2: any }[] = [];

    const map1 = new Map<string, any>(sections1.map((s: any) => [s.id, s]));
    const map2 = new Map<string, any>(sections2.map((s: any) => [s.id, s]));

    // Check modified & removed sections
    map1.forEach((sec1: any, secId: string) => {
      const sec2: any = map2.get(secId);
      if (!sec2) {
        fieldDiffs.push({ sectionId: secId, sectionTitle: sec1.title || secId, field: 'section_presence', val1: 'Present', val2: 'Removed' });
      } else {
        const props1 = sec1.props || {};
        const props2 = sec2.props || {};
        const keys = new Set([...Object.keys(props1), ...Object.keys(props2)]);

        keys.forEach((k) => {
          if (JSON.stringify(props1[k]) !== JSON.stringify(props2[k])) {
            fieldDiffs.push({
              sectionId: secId,
              sectionTitle: sec1.title || secId,
              field: k,
              val1: props1[k] ?? '(none)',
              val2: props2[k] ?? '(none)',
            });
          }
        });
      }
    });

    // Check added sections
    map2.forEach((sec2: any, secId: string) => {
      if (!map1.has(secId)) {
        fieldDiffs.push({ sectionId: secId, sectionTitle: sec2.title || secId, field: 'section_presence', val1: 'Not Present', val2: 'Added' });
      }
    });

    return NextResponse.json({
      success: true,
      v1: { id: v1.id, versionNumber: v1.versionNumber, label: v1.label },
      v2: { id: v2.id, versionNumber: v2.versionNumber, label: v2.label },
      totalDiffs: fieldDiffs.length,
      fieldDiffs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Version comparison failed' }, { status: 500 });
  }
}
