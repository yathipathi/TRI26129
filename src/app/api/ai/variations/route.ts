import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';
import { SectionSpec } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { sectionSpec, instruction } = await req.json();

    if (!sectionSpec) {
      return NextResponse.json({ error: 'sectionSpec is required' }, { status: 400 });
    }

    if (sectionSpec.isLocked) {
      return NextResponse.json({ error: 'Section is locked against edits' }, { status: 400 });
    }

    const currentProps = sectionSpec.props || {};

    const prompt = `You are a Creative Director. Generate 3 distinct copy/layout variations for section "${sectionSpec.title}" (${sectionSpec.type}).
Instruction context: "${instruction || 'Create distinct stylistic alternatives'}"

Current Props: ${JSON.stringify(currentProps)}

Return ONLY a JSON array containing 3 distinct updated prop objects:
[
  { "title": "Variation 1 Title", "subtitle": "Variation 1 Subtitle", ... },
  { "title": "Variation 2 Title", "subtitle": "Variation 2 Subtitle", ... },
  { "title": "Variation 3 Title", "subtitle": "Variation 3 Subtitle", ... }
]`;

    let variations = [];
    try {
      const rawJson = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.8 });
      variations = JSON.parse(rawJson);
    } catch {
      variations = [
        { ...currentProps, title: `${currentProps.title || 'Section'} (Option A - Bold & Direct)` },
        { ...currentProps, title: `${currentProps.title || 'Section'} (Option B - Feature Focused)` },
        { ...currentProps, title: `${currentProps.title || 'Section'} (Option C - Minimalist)` },
      ];
    }

    return NextResponse.json({
      success: true,
      sectionId: sectionSpec.id,
      variations,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate section variations' }, { status: 500 });
  }
}
