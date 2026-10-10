import { NextRequest, NextResponse } from 'next/server';
import { getSiteMeta, getSiteFile, saveSiteFiles } from '@/lib/storage';
import { callLLM } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { siteId, instruction } = await req.json();

    if (!siteId || !instruction) {
      return NextResponse.json({ error: 'siteId and instruction are required' }, { status: 400 });
    }

    const meta = getSiteMeta(siteId);
    if (!meta) {
      return NextResponse.json({ error: `Site ${siteId} not found` }, { status: 404 });
    }

    const indexFile = getSiteFile(siteId, 'index.html');
    if (!indexFile) {
      return NextResponse.json({ error: `index.html for ${siteId} not found` }, { status: 404 });
    }

    // Call LLM to refine index.html & styles
    const prompt = `You are a Senior Frontend Engineer. The user wants to refine an existing website.
Instruction: "${instruction}"

Current HTML (index.html):
\`\`\`html
${indexFile.content.slice(0, 3000)}
\`\`\`

Apply the edit instruction strictly (e.g. change colors, add sections, update text).
Return ONLY the updated complete HTML string for index.html. No markdown fences.`;

    let updatedHtml = await callLLM([{ role: 'user', content: prompt }], { temperature: 0.3 });
    updatedHtml = updatedHtml.replace(/^```html\s*/i, '').replace(/\s*```$/i, '').trim();

    // Save updated index.html
    const updatedFiles: Record<string, string> = {};
    for (const f of meta.files) {
      const fileData = getSiteFile(siteId, f);
      if (fileData) {
        updatedFiles[f] = f === 'index.html' ? updatedHtml : fileData.content;
      }
    }

    const updatedMeta = saveSiteFiles(siteId, updatedFiles, {
      name: meta.name,
      type: meta.type,
      templateSlug: meta.templateSlug,
      prompt: `${meta.prompt} | Refine: ${instruction}`,
      sources: meta.sources,
      brief: meta.brief,
    });

    return NextResponse.json({ success: true, siteId, meta: updatedMeta });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Refining site failed' }, { status: 500 });
  }
}
