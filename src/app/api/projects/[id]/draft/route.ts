import { NextRequest, NextResponse } from 'next/server';
import { getProjectById, getVersionsForProject } from '@/lib/db';
import { saveSiteFiles, getSiteFile } from '@/lib/storage';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

// GET draft spec for project
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const versions = getVersionsForProject(id);
    const latestVersion = versions[0];
    const spec = latestVersion?.siteSpec || latestVersion?.spec || {
      meta: { siteId: id, siteName: project.name, siteType: project.type, goal: '', audience: '', tone: '', language: 'English' },
      theme: { palette: { primary: '#09090b', secondary: '#ffffff', accent: '#f97316', background: '#ffffff', text: '#000000' }, fonts: { sans: 'Inter', mono: 'JetBrains Mono' }, radius: '0.25rem' },
      pages: [
        {
          slug: 'index.html',
          title: 'Home',
          seo: { metaTitle: project.name, metaDescription: project.name },
          sections: [
            { id: 'sec-hero-1', type: 'hero', title: project.name, subtitle: 'Built with SiteForge Visual Editor', props: { title: project.name } }
          ]
        }
      ],
      nav: { brandName: project.name, links: [{ label: 'Home', href: 'index.html' }] },
      footer: { brandName: project.name, copyright: '© 2026 SiteForge', links: [] },
      data: {}
    };

    return NextResponse.json({ success: true, project, spec, revision: project.currentVersion });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch draft' }, { status: 500 });
  }
}

// PUT autosave working draft
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = getProjectById(id, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const { spec, revision } = await req.json();

    if (!spec || !spec.pages) {
      return NextResponse.json({ error: 'Invalid SiteSpec payload' }, { status: 400 });
    }

    // Save updated index.html & spec.json files to disk
    const files: Record<string, string> = {
      'spec.json': JSON.stringify(spec, null, 2),
    };

    saveSiteFiles(id, files, {
      name: spec.meta?.siteName || project.name,
      type: spec.meta?.siteType || project.type,
      prompt: `Updated via Visual Editor`,
      sources: [],
    });

    return NextResponse.json({ success: true, revision: (revision || 1) + 1, timestamp: Date.now() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Draft save failed' }, { status: 500 });
  }
}
