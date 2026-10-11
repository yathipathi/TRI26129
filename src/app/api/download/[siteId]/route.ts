import { NextRequest, NextResponse } from 'next/server';
import { getSiteMeta, getSiteFile } from '@/lib/storage';
import { getProjectById } from '@/lib/db';
import { generateFullProjectDocumentation } from '@/lib/project-doc-generator';
import JSZip from 'jszip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  try {
    const { siteId } = await params;
    const meta = getSiteMeta(siteId);
    const dbProject = getProjectById(siteId);

    if (!meta && !dbProject) {
      return NextResponse.json({ error: `Site ${siteId} not found` }, { status: 404 });
    }

    const zip = new JSZip();

    // 1. Add Code & Static Files
    if (meta) {
      for (const fileName of meta.files) {
        const fileData = getSiteFile(siteId, fileName);
        if (fileData) {
          zip.file(fileName, fileData.content);
        }
      }
    } else if (dbProject) {
      // Add db project files if available
      if (dbProject.fileTree) {
        for (const [filePath, content] of Object.entries(dbProject.fileTree)) {
          zip.file(filePath, content);
        }
      }
    }

    // 2. Generate and Add Comprehensive Technical Documentation Dossier
    const projectTitle = meta?.name || dbProject?.name || 'Generated Website';
    const projectCategory = meta?.type || dbProject?.type || 'Web Application';
    const projectPrompt = meta?.prompt || '';
    const sources = meta?.sources || [];

    // Extract pages/sections
    let pages: any[] = [];
    if (dbProject?.siteSpec && 'pages' in dbProject.siteSpec && dbProject.siteSpec.pages) {
      pages = dbProject.siteSpec.pages;
    } else if (meta?.files) {
      pages = meta.files
        .filter((f) => f.endsWith('.html'))
        .map((f) => ({
          slug: f,
          title: f.replace('.html', '').replace(/^\w/, (c) => c.toUpperCase()),
        }));
    }

    const docs = generateFullProjectDocumentation({
      title: projectTitle,
      id: siteId,
      category: projectCategory,
      prompt: projectPrompt,
      pages,
      sources,
      createdAt: meta?.createdAt || dbProject?.createdAt || Date.now(),
    });

    // Bundle each doc into the zip archive under docs/
    for (const [docPath, docContent] of Object.entries(docs)) {
      zip.file(docPath, docContent);
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${siteId}-complete-package.zip"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'ZIP creation failed' }, { status: 500 });
  }
}
