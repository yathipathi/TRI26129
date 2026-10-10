import { getAllUserSourceChunks } from './db';
import { SourceChunk, SectionCitation } from '@/types';
import { callLLM } from './llm';

export interface RetrievalResult {
  chunkId: string;
  sourceId: string;
  sourceTitle: string;
  content: string;
  pageAnchor?: string;
  score: number;
}

// BM25 / Term-frequency hybrid keyword retrieval
export function retrieveRelevantChunks(
  userId: string,
  query: string,
  projectId?: string,
  topK: number = 5
): RetrievalResult[] {
  const allChunks = getAllUserSourceChunks(userId, projectId);
  if (!allChunks || allChunks.length === 0) return [];

  const queryTerms = query.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter((t) => t.length > 2);
  if (queryTerms.length === 0) {
    return allChunks.slice(0, topK).map((c) => ({
      chunkId: c.id,
      sourceId: c.sourceId,
      sourceTitle: c.sourceTitle,
      content: c.content || c.text,
      pageAnchor: c.pageAnchor,
      score: 1.0,
    }));
  }

  const scored = allChunks.map((chunk) => {
    const text = (chunk.content || chunk.text).toLowerCase();
    let score = 0;

    queryTerms.forEach((term) => {
      // Exact term matches
      const matches = (text.match(new RegExp(`\\b${term}\\b`, 'gi')) || []).length;
      score += matches * 2;

      // Substring matches
      if (text.includes(term)) {
        score += 0.5;
      }
    });

    // Length normalization factor
    const tokenCount = chunk.tokenCount || 100;
    const normScore = score / Math.sqrt(tokenCount);

    return {
      chunkId: chunk.id,
      sourceId: chunk.sourceId,
      sourceTitle: chunk.sourceTitle,
      content: chunk.content || chunk.text,
      pageAnchor: chunk.pageAnchor,
      score: Math.round(normScore * 100) / 100,
    };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Build strict RAG prompt context with injection hardening
export function formatRAGContextPrompt(results: RetrievalResult[], strictMode: boolean = true): string {
  if (results.length === 0) {
    if (strictMode) {
      return `\n[STRICT GROUNDING MODE ACTIVE]\nNo relevant sources were found in your Knowledge Library.\nYou MUST respond with: "Not found in your uploaded sources." and MUST NOT invent any facts.\n`;
    }
    return '';
  }

  const formattedSources = results
    .map(
      (r, i) =>
        `<source index="${i + 1}" source_id="${r.sourceId}" chunk_id="${r.chunkId}" title="${escapeXML(r.sourceTitle)}"${
          r.pageAnchor ? ` anchor="${escapeXML(r.pageAnchor)}"` : ''
        }>\n${escapeXML(r.content)}\n</source>`
    )
    .join('\n\n');

  return `
<context_sources>
${formattedSources}
</context_sources>

[CRITICAL RAG INSTRUCTIONS]
1. Use ONLY the factual information contained in the <context_sources> above to answer or update content.
2. Insert inline numeric citations like [1], [2] corresponding to the index of the source used for every claim.
3. ${
    strictMode
      ? 'STRICT GROUNDING ENFORCED: Do NOT add any outside knowledge, dates, quotes, or numbers not present in the sources. If information is not in sources, explicitly state "Not found in your uploaded sources."'
      : 'Prioritize provided sources over general knowledge and add inline citations.'
  }
`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Verify claim against RAG context using LLM
export async function verifyClaimAgainstSources(
  userId: string,
  claimText: string,
  projectId?: string
): Promise<{
  status: 'VERIFIED' | 'CONTRADICTED' | 'UNGROUNDED';
  explanation: string;
  sourceQuote?: string;
  sourceTitle?: string;
  citationId?: string;
}> {
  const topChunks = retrieveRelevantChunks(userId, claimText, projectId, 3);
  if (topChunks.length === 0) {
    return {
      status: 'UNGROUNDED',
      explanation: 'No relevant knowledge sources were found in your library for this claim.',
    };
  }

  const prompt = `You are a strict academic fact-checker.
Compare the user claim against the reference source snippets below.

CLAIM TO VERIFY:
"${claimText}"

REFERENCE SOURCES:
${topChunks.map((c, i) => `[Source ${i + 1}: ${c.sourceTitle}]\n"${c.content}"`).join('\n\n')}

Respond ONLY with a JSON object in this exact format:
{
  "status": "VERIFIED" | "CONTRADICTED" | "UNGROUNDED",
  "explanation": "Short 1-2 sentence explanation",
  "sourceQuote": "Exact quote from source if verified/contradicted or null",
  "matchedSourceTitle": "Title of source or null"
}
`;

  try {
    const rawRes = await callLLM([{ role: 'user', content: prompt }], { jsonMode: true });
    const parsed = JSON.parse(rawRes);
    return {
      status: parsed.status || 'UNGROUNDED',
      explanation: parsed.explanation || 'Verification complete',
      sourceQuote: parsed.sourceQuote || undefined,
      sourceTitle: parsed.matchedSourceTitle || undefined,
    };
  } catch (err: any) {
    return {
      status: 'UNGROUNDED',
      explanation: `Verification error: ${err.message}`,
    };
  }
}
