import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { getRegistryItem, SECTION_REGISTRY } from '@/lib/section-registry';
import { SectionSpec } from '@/types';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { description, siteName, siteType } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const availableTypes = SECTION_REGISTRY.map((r) => r.type).join(', ');

    const prompt = `Select the best matching section type from [${availableTypes}] for this user description:
"${description}"
Site Context: ${siteName} (${siteType})

Return a raw JSON object with keys:
- "type": string (must be one of [${availableTypes}])
- "title": string
- "subtitle": string
- "badge": string
- "props": object containing appropriate props for that section type`;

    let chosenType: any = 'hero';
    let newProps: any = {};
    let title = 'Custom AI Section';

    try {
      const rawJson = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.3 });
      const parsed = JSON.parse(rawJson);
      if (parsed.type && SECTION_REGISTRY.some((r) => r.type === parsed.type)) {
        chosenType = parsed.type;
      }
      title = parsed.title || description.slice(0, 30);
      newProps = parsed.props || {};
    } catch {
      chosenType = 'features';
    }

    const registryItem = getRegistryItem(chosenType);
    const finalProps = { ...(registryItem?.defaultProps || {}), ...newProps };

    const newSection: SectionSpec = {
      id: `sec-${chosenType}-${crypto.randomUUID().substring(0, 6)}`,
      type: chosenType,
      title: title || registryItem?.name || chosenType,
      subtitle: finalProps.subtitle || '',
      badge: finalProps.badge || 'AI GENERATED',
      props: finalProps,
      rationale: `Added by AI based on prompt: "${description}"`,
    };

    return NextResponse.json({ success: true, section: newSection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'AI section generation failed' }, { status: 500 });
  }
}
