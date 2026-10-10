import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { SectionSpec } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { action, section, targetLanguage } = await req.json();

    if (!action || !section) {
      return NextResponse.json({ error: 'Action and section are required' }, { status: 400 });
    }

    const updatedSection: SectionSpec = JSON.parse(JSON.stringify(section));

    if (updatedSection.isLocked) {
      return NextResponse.json({ error: 'Section is locked against edits' }, { status: 400 });
    }

    const prompt = `Perform quick action "${action}" ${targetLanguage ? `to language ${targetLanguage}` : ''} on this section JSON:
${JSON.stringify(updatedSection.props)}

Return valid JSON containing updated section props.`;

    try {
      const rawJson = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.3 });
      const newProps = JSON.parse(rawJson);
      updatedSection.props = { ...updatedSection.props, ...newProps };
    } catch {
      if (action === 'shorter') {
        updatedSection.props.subtitle = (updatedSection.props.subtitle || '').substring(0, 50) + '...';
      } else {
        updatedSection.props.title = `${updatedSection.props.title || 'Section'} (${action.toUpperCase()})`;
      }
    }

    return NextResponse.json({ success: true, action, section: updatedSection });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Quick action failed' }, { status: 500 });
  }
}
