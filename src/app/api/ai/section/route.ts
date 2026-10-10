import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { SectionSpec, SectionType } from '@/types';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { prompt, targetPosition, siteType } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Section prompt is required' }, { status: 400 });
    }

    const availableTypes: SectionType[] = [
      'hero', 'features', 'stats', 'testimonials', 'pricing', 'faq', 'cta', 'contact',
      'gallery', 'blog', 'team', 'about', 'timeline', 'services-grid', 'menu-grid',
      'products-grid', 'booking', 'summary', 'key-points', 'glossary', 'flashcards',
      'quiz', 'compare-table', 'concept-map', 'bibliography', 'faq-sources'
    ];

    const systemPrompt = `You are a Lead Web Architect. Convert this user request into a new website section specification:
"${prompt}"

Available Section Types: ${JSON.stringify(availableTypes)}

Return a JSON object:
{
  "type": "<one of available Section Types>",
  "title": "<Section Title>",
  "subtitle": "<Subtitle>",
  "badge": "<Badge text or null>",
  "props": { ... },
  "rationale": "<1-sentence explanation why this section was created>",
  "customizationLimit": "<Optional note if request exceeded default component limits>"
}`;

    let sectionSpec: SectionSpec = {
      id: 'sec-' + crypto.randomUUID().substring(0, 8),
      type: 'features',
      title: 'AI Generated Section',
      subtitle: prompt,
      props: {
        title: 'AI Generated Section',
        subtitle: prompt,
        items: [
          { id: 'item-1', title: 'Feature 1', description: 'Generated from request: ' + prompt }
        ]
      },
      rationale: 'Generated section matching user description.'
    };

    try {
      const rawJson = await callLLM([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ], { jsonMode: true, temperature: 0.4 });

      const parsed = JSON.parse(rawJson);
      if (parsed && parsed.type) {
        sectionSpec = {
          id: 'sec-' + crypto.randomUUID().substring(0, 8),
          type: availableTypes.includes(parsed.type) ? parsed.type : 'features',
          title: parsed.title || 'Custom Section',
          subtitle: parsed.subtitle || '',
          badge: parsed.badge || 'AI GENERATED',
          rationale: parsed.rationale || 'Built from user prompt.',
          props: {
            title: parsed.title || 'Custom Section',
            subtitle: parsed.subtitle || '',
            badge: parsed.badge || 'AI GENERATED',
            ...(parsed.props || {})
          }
        };
      }
    } catch {
      // Fallback section
    }

    return NextResponse.json({
      success: true,
      section: sectionSpec,
      position: targetPosition || 'end',
      changelog: `Added AI section "${sectionSpec.title}" (${sectionSpec.type})`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Section generation failed' }, { status: 500 });
  }
}
