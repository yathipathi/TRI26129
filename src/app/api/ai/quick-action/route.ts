import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { SectionSpec } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { action, sectionSpec, targetLanguage, allowPinnedOverwrite } = await req.json();

    if (!action || !sectionSpec) {
      return NextResponse.json({ error: 'Action and sectionSpec are required' }, { status: 400 });
    }

    if (sectionSpec.isLocked) {
      return NextResponse.json({ error: 'Section is locked against edits' }, { status: 400 });
    }

    const beforeProps = JSON.parse(JSON.stringify(sectionSpec.props || {}));
    const pinnedKeys = sectionSpec.pinnedFields || [];
    const skippedPinnedFields: string[] = [];

    const promptMap: Record<string, string> = {
      'Shorter': 'Make all text in this section 40% shorter, punchier, and more concise.',
      'Longer': 'Elaborate on all text in this section with richer detail and benefits.',
      'Change tone': 'Rewrite this section in a warm, friendly, and engaging tone.',
      'Fix grammar': 'Correct any spelling, grammar, or punctuation errors in this section.',
      'Simplify for beginners': 'Simplify the vocabulary and concepts so a beginner can easily understand.',
      'Translate': `Translate all titles, descriptions, and labels in this section to ${targetLanguage || 'Telugu'}. Keep technical terms clear.`,
      'Add examples': 'Add concrete real-world examples and bullet points to this section.',
      'Add more items': 'Add 2 more high-quality items/features to the items array.',
      'Improve SEO': 'Optimize headings and copy for search engines with relevant high-intent keywords.',
      'Improve accessibility': 'Ensure clear contrast headers, descriptive labels, and action-oriented CTA text.',
      'Explain this section simply': 'Provide a 2-sentence plain-language explanation of why this section exists and what purpose it serves.',
    };

    const instruction = promptMap[action] || `Perform action: ${action} on this section.`;

    const systemPrompt = `You are a Senior UX Copywriter. Refine the section props based on this request: "${instruction}".
Return JSON object of updated props. Keep unchanged keys intact.`;

    let updatedProps = { ...beforeProps };

    try {
      const rawJson = await callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(beforeProps) },
      ], { jsonMode: true, temperature: 0.3 });
      
      const parsed = JSON.parse(rawJson);
      if (parsed && typeof parsed === 'object') {
        updatedProps = { ...updatedProps, ...parsed };
      }
    } catch {
      if (action === 'Shorter') {
        if (updatedProps.subtitle) updatedProps.subtitle = updatedProps.subtitle.substring(0, 50) + '...';
      } else if (action === 'Translate') {
        updatedProps.title = `${updatedProps.title} (${targetLanguage || 'Translated'})`;
      }
    }

    // Pinned fields check
    Object.keys(updatedProps).forEach((key) => {
      if (pinnedKeys.includes(key) && !allowPinnedOverwrite) {
        skippedPinnedFields.push(key);
        updatedProps[key] = beforeProps[key];
      }
    });

    return NextResponse.json({
      success: true,
      action,
      sectionId: sectionSpec.id,
      beforeProps,
      afterProps: updatedProps,
      skippedPinnedFields,
      changelog: `Applied quick action "${action}" to section ${sectionSpec.title || sectionSpec.id}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Quick action failed' }, { status: 500 });
  }
}
