import { NextRequest, NextResponse } from 'next/server';
import { renderSectionToHtml } from '@/lib/code-generator';
import { renderUnverifiedFlagBadge } from '@/lib/evidence-pass';
import { SectionSpec } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { section } = await req.json();

    if (!section || !section.type) {
      return NextResponse.json({ error: 'Section spec is required' }, { status: 400 });
    }

    // Convert section spec to HTML
    let html = renderSectionToHtml({
      id: section.id,
      type: section.type,
      title: section.title || section.props?.title || '',
      subtitle: section.subtitle || section.props?.subtitle || '',
      badge: section.badge || section.props?.badge || '',
      ctaPrimary: section.props?.ctaPrimaryText ? { text: section.props.ctaPrimaryText, link: section.props.ctaPrimaryLink || '#' } : undefined,
      ctaSecondary: section.props?.ctaSecondaryText ? { text: section.props.ctaSecondaryText, link: section.props.ctaSecondaryLink || '#' } : undefined,
      items: section.props?.items || [],
      authFields: section.props?.authFields,
    });

    // If unverified claims present, inject "Needs Review" flag badge
    if (section.flags && section.flags.some((f: any) => f.status === 'unverified')) {
      const badgeHtml = renderUnverifiedFlagBadge('Unverified claim - please review in editor');
      html = html.replace(/(<h[1-6][^>]*>)/i, `$1 ${badgeHtml} `);
    }

    return NextResponse.json({ success: true, sectionId: section.id, html });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Render failed' }, { status: 500 });
  }
}
