import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';
import { renderSectionToHtml } from '@/lib/code-generator';
import { SectionSpec } from '@/types';

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

    const body = await req.json();
    const sectionSpec: SectionSpec = body.sectionSpec || body.section;

    if (!sectionSpec || !sectionSpec.id || !sectionSpec.type) {
      return NextResponse.json({ error: 'Invalid section spec' }, { status: 400 });
    }

    // Convert SectionSpec to legacy Section format for renderSectionToHtml if needed
    const sectionForRender: any = {
      id: sectionSpec.id,
      type: sectionSpec.type,
      title: sectionSpec.title || (sectionSpec.props?.title as string) || '',
      subtitle: sectionSpec.subtitle || (sectionSpec.props?.subtitle as string) || '',
      badge: sectionSpec.badge || (sectionSpec.props?.badge as string) || '',
      ctaPrimary: sectionSpec.props?.ctaPrimary,
      ctaSecondary: sectionSpec.props?.ctaSecondary,
      items: sectionSpec.props?.items || [],
      authFields: sectionSpec.props?.authFields || [],
      ...sectionSpec.props,
    };

    const sectionHtml = renderSectionToHtml(sectionForRender);

    return NextResponse.json({
      success: true,
      sectionId: sectionSpec.id,
      html: sectionHtml,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Render failed' }, { status: 500 });
  }
}
