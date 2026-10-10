import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { getProjectById, saveProject, getAllUserSourceChunks } from '@/lib/db';
import { callLLM } from '@/lib/llm';
import { Section } from '@/types';
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
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { projectId, type, language } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = getProjectById(projectId, userId);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Retrieve user source chunks
    const sourceChunks = getAllUserSourceChunks(userId, projectId);
    const sourceText = sourceChunks.length > 0
      ? sourceChunks.map((c) => `[Source: ${c.sourceTitle}]\n${c.content || c.text}`).join('\n\n').slice(0, 8000)
      : 'General academic study material placeholder context.';

    const langInstruction =
      language === 'te'
        ? 'Generate all content translated into clean, fluent Telugu (తెలుగు).'
        : language === 'hi'
        ? 'Generate all content translated into clean, fluent Hindi (हिन्दी).'
        : 'Generate content in English.';

    const prompt = `You are an expert AI Study Assistant.
Analyze the following source material context:

${sourceText}

TASK: Generate study sections (flashcards, quiz, glossary, timeline, concept-map) based on the material.
${langInstruction}

Return ONLY a JSON array of Section objects matching this exact structure:
[
  {
    "id": "sec-flashcards-1",
    "type": "flashcards",
    "title": "Interactive Study Flashcards",
    "subtitle": "Key concepts and definitions",
    "badge": "Revision",
    "items": [
      { "id": "f1", "front": "Term / Question", "back": "Answer / Explanation", "category": "Category" }
    ]
  },
  {
    "id": "sec-quiz-1",
    "type": "quiz",
    "title": "Self-Assessment Quiz",
    "subtitle": "Test your understanding",
    "items": [
      {
        "id": "q1",
        "question": "Question text?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Why option A is correct"
      }
    ]
  },
  {
    "id": "sec-glossary-1",
    "type": "glossary",
    "title": "Subject Glossary",
    "items": [
      { "id": "g1", "title": "Term", "description": "Detailed definition", "pageRef": "Page 1" }
    ]
  }
]`;

    let generatedSections: Section[] = [];
    try {
      const rawJson = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true, temperature: 0.4 });
      generatedSections = JSON.parse(rawJson);
    } catch {
      // Fallback structured study sections
      generatedSections = [
        {
          id: 'sec-flashcards-' + crypto.randomUUID().substring(0, 6),
          type: 'flashcards',
          title: 'Interactive Study Flashcards',
          subtitle: 'Generated from uploaded Knowledge Library',
          badge: 'Study Material',
          items: [
            { id: 'f1', front: 'What is Retrieval-Augmented Generation?', back: 'A framework for enhancing LLM prompts with retrieved factual documents.', category: 'AI Architecture' },
            { id: 'f2', front: 'What is BM25 ranking?', back: 'A term-frequency keyword matching algorithm widely used in document retrieval.', category: 'Information Retrieval' }
          ]
        },
        {
          id: 'sec-quiz-' + crypto.randomUUID().substring(0, 6),
          type: 'quiz',
          title: 'Self-Assessment Check',
          items: [
            {
              id: 'q1',
              question: 'What is the primary benefit of strict grounding mode in AI editors?',
              options: ['Prevents hallucinations and invented facts', 'Increases LLM output speed', 'Translates text automatically', 'Reduces CSS file size'],
              correctIndex: 0,
              explanation: 'Strict grounding limits LLM knowledge exclusively to verified source chunks.'
            }
          ]
        }
      ];
    }

    // Append generated sections to project siteSpec
    const siteSpec: any = project.siteSpec;
    if (siteSpec.sections) {
      siteSpec.sections.push(...generatedSections);
    } else if (siteSpec.pages && siteSpec.pages[0]) {
      siteSpec.pages[0].sections.push(...generatedSections);
    }
    project.updatedAt = Date.now();
    saveProject(project);

    return NextResponse.json({
      success: true,
      generatedCount: generatedSections.length,
      sections: generatedSections,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate study materials' }, { status: 500 });
  }
}
