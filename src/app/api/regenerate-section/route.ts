import { NextRequest, NextResponse } from 'next/server';
import { regenerateSectionContent } from '@/lib/ai-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, instruction, projectContext } = body;

    if (!section || !instruction) {
      return NextResponse.json(
        { error: 'Section and instruction are required.' },
        { status: 400 }
      );
    }

    const updated = regenerateSectionContent(section, instruction, projectContext);

    return NextResponse.json({
      success: true,
      section: updated,
    });
  } catch (error: any) {
    console.error('Error regenerating section:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate section.' },
      { status: 500 }
    );
  }
}
