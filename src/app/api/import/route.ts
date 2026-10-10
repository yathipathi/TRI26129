import { NextRequest, NextResponse } from 'next/server';
import { saveSiteFiles } from '@/lib/storage';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const siteSpec = body.spec || body;

    if (!siteSpec || !siteSpec.meta) {
      return NextResponse.json({ error: 'Invalid SiteSpec JSON format' }, { status: 400 });
    }

    const siteId = 'site-imp-' + crypto.randomUUID().substring(0, 8);
    const siteName = siteSpec.meta.siteName || 'Imported Project';

    // Generate HTML files from imported spec
    const files: Record<string, string> = {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${siteName} — Home</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-black p-12 font-sans">
  <h1 class="text-4xl font-black uppercase mb-4">${siteName}</h1>
  <p class="text-lg text-neutral-700">Imported from SiteSpec JSON payload.</p>
</body>
</html>`,
      'spec.json': JSON.stringify(siteSpec, null, 2),
    };

    saveSiteFiles(siteId, files, {
      name: siteName,
      type: siteSpec.meta.siteType || 'Imported',
      prompt: `Imported from spec.json (${siteName})`,
      sources: [],
    });

    return NextResponse.json({ success: true, siteId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Import failed' }, { status: 500 });
  }
}
