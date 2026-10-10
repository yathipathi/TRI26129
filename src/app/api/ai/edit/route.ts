import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { runEvidencePass } from '@/lib/evidence-pass';
import { runWebSearch } from '@/lib/search';
import { verifyJwt } from '@/lib/auth';
import { retrieveRelevantChunks, formatRAGContextPrompt } from '@/lib/rag';
import { SiteSpec, SectionSpec } from '@/types';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    const body = await req.json();
    const { spec, scope, targetSectionId, instruction, allowPinnedOverwrite, projectId, useKnowledgeSources, strictGrounding } = body;

    if (!spec || !instruction) {
      return NextResponse.json({ error: 'Spec and instruction are required' }, { status: 400 });
    }

    const proposedSpec: SiteSpec = JSON.parse(JSON.stringify(spec));
    const activePage = proposedSpec.pages[0];
    if (!activePage) return NextResponse.json({ error: 'No active page found in spec' }, { status: 400 });

    const diffSummary: { sectionId: string; sectionTitle: string; beforeProps: any; afterProps: any }[] = [];
    const skippedPinnedFields: string[] = [];

    // Check RAG Knowledge Base if requested or if userId is available
    let ragPromptContext = '';
    if (useKnowledgeSources && userId) {
      const topChunks = retrieveRelevantChunks(userId, instruction, projectId, 4);
      ragPromptContext = formatRAGContextPrompt(topChunks, strictGrounding ?? true);
    }

    // Scope check: If scope = 'section', operate ONLY on targetSectionId
    if (scope === 'section' && targetSectionId) {
      const targetSection = activePage.sections.find((s) => s.id === targetSectionId);
      if (targetSection) {
        if (targetSection.isLocked) {
          return NextResponse.json({ error: 'Target section is locked against edits' }, { status: 400 });
        }

        const beforeProps = JSON.parse(JSON.stringify(targetSection.props || {}));

        // Research if instruction contains factual claim requests and RAG was not used
        let searchContext = '';
        if (!ragPromptContext && /\b(\$|\d+|price|stat|address|hours|review|award)\b/i.test(instruction)) {
          const results = await runWebSearch(`${proposedSpec.meta.siteName} ${instruction}`, 2);
          searchContext = results.map((r) => `${r.title}: ${r.snippet}`).join('\n');
        }

        const prompt = `You are a Lead UX Copywriter and Academic Assistant. Refine section "${targetSection.title}" (${targetSection.type}) based on this instruction:
"${instruction}"

Current Props: ${JSON.stringify(targetSection.props)}
${ragPromptContext}
${searchContext ? `Web Research Context:\n${searchContext}` : ''}

Return a valid JSON object containing updated props. Keep unchanged keys intact.`;

        try {
          const rawJson = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.3 });
          const updatedProps = JSON.parse(rawJson);

          // Pinned fields check
          const pinnedKeys = targetSection.pinnedFields || [];
          Object.keys(updatedProps).forEach((key) => {
            if (pinnedKeys.includes(key) && !allowPinnedOverwrite) {
              skippedPinnedFields.push(key);
              updatedProps[key] = beforeProps[key]; // Keep original pinned value
            }
          });

          targetSection.props = { ...targetSection.props, ...updatedProps };
          diffSummary.push({
            sectionId: targetSection.id,
            sectionTitle: targetSection.title,
            beforeProps,
            afterProps: targetSection.props,
          });
        } catch {
          // Fallback title update
          targetSection.props.title = `${targetSection.title} (AI Refined)`;
        }
      }
    } else {
      // Page or Site Scope
      const prompt = `Refine the website sections based on instruction: "${instruction}".
${ragPromptContext}
Return JSON array of updated sections.`;
      try {
        const rawJson = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.3 });
        const parsed = JSON.parse(rawJson);
        if (Array.isArray(parsed)) {
          activePage.sections.forEach((sec, idx) => {
            if (!sec.isLocked && parsed[idx]) {
              const beforeProps = JSON.parse(JSON.stringify(sec.props));
              sec.props = { ...sec.props, ...parsed[idx].props };
              diffSummary.push({ sectionId: sec.id, sectionTitle: sec.title, beforeProps, afterProps: sec.props });
            }
          });
        }
      } catch {
        // Fallback
      }
    }

    // Run evidence pass on updated claims
    const evidenceResult = runEvidencePass(proposedSpec, []);

    const proposal = {
      id: 'prop-' + crypto.randomUUID().substring(0, 8),
      scope,
      instruction,
      targetSectionId,
      proposedSpec,
      diffSummary,
      skippedPinnedFields,
      changelog: `Refined ${diffSummary.length} section(s) via AI editing`,
      explanation: `Applied AI refinement based on "${instruction}"${
        skippedPinnedFields.length > 0
          ? `. Skipped pinned fields: ${skippedPinnedFields.join(', ')}`
          : ''
      }`,
    };

    return NextResponse.json({
      success: true,
      proposal,
      evidenceResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI Edit operation failed' }, { status: 500 });
  }
}
