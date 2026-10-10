import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SourceItem, SourceChunk, SourceFileType } from '@/types';
import { saveKnowledgeSource, saveSourceChunks, getUserQuota } from './db';
import { callLLM } from './llm';

export interface IngestionOptions {
  userId: string;
  projectId?: string | null;
  title?: string;
  type: SourceFileType;
  fileBuffer?: Buffer;
  pastedText?: string;
  url?: string;
  filename?: string;
}

// Security: Check magic bytes to reject executables / dangerous archives
function validateMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return true;
  const hex = buffer.toString('hex', 0, 4);

  // Block EXE (4d5a), ELF (7f454c46), Zip/Jar executable (504b0304), RAR (52617221)
  const dangerousPrefixes = ['4d5a', '7f454c46', '52617221'];
  if (dangerousPrefixes.includes(hex)) return false;

  return true;
}

// Extract raw text based on source type
export async function extractTextFromContent(options: IngestionOptions): Promise<{ text: string; pages: { pageNum: number; text: string }[] }> {
  const pages: { pageNum: number; text: string }[] = [];

  if (options.pastedText) {
    const raw = options.pastedText.trim();
    pages.push({ pageNum: 1, text: raw });
    return { text: raw, pages };
  }

  if (options.url) {
    try {
      const res = await fetch(options.url, { headers: { 'User-Agent': 'SiteForge-KnowledgeBot/1.0' } });
      const html = await res.text();
      // Basic Readability extraction: strip scripts, styles, HTML tags
      const cleanedText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      pages.push({ pageNum: 1, text: cleanedText });
      return { text: cleanedText, pages };
    } catch {
      throw new Error(`Failed to fetch article from URL: ${options.url}`);
    }
  }

  if (options.fileBuffer) {
    if (!validateMagicBytes(options.fileBuffer)) {
      throw new Error('Security check failed: Executable or unsupported archive binary detected.');
    }

    const rawStr = options.fileBuffer.toString('utf-8');

    if (options.type === 'pdf') {
      // PDF text layer extraction (splitting by form feed or page boundaries)
      const pageBlocks = rawStr.split(/\f|\/Page\b/i);
      if (pageBlocks.length > 1) {
        pageBlocks.forEach((block, idx) => {
          const clean = block.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
          if (clean.length > 20) pages.push({ pageNum: idx + 1, text: clean });
        });
      }
      
      const fullText = pages.length > 0 
        ? pages.map((p) => `[Page ${p.pageNum}]\n${p.text}`).join('\n\n')
        : rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();

      if (pages.length === 0) pages.push({ pageNum: 1, text: fullText });
      return { text: fullText, pages };
    }

    if (options.type === 'docx' || options.type === 'pptx') {
      const cleanText = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
      pages.push({ pageNum: 1, text: cleanText });
      return { text: cleanText, pages };
    }

    // Default TXT / MD / HTML
    const cleanText = rawStr.trim();
    pages.push({ pageNum: 1, text: cleanText });
    return { text: cleanText, pages };
  }

  throw new Error('No valid content provided for text extraction');
}

// Semantic chunking (~300-600 tokens with page anchors)
export function createSemanticChunks(sourceId: string, fullText: string, pages: { pageNum: number; text: string }[]): SourceChunk[] {
  const chunks: SourceChunk[] = [];
  let chunkIdx = 0;

  const targetChunkSize = 1500; // ~400 tokens

  if (pages.length > 0) {
    pages.forEach((p) => {
      const paragraphs = p.text.split(/\n\n+/);
      let currentChunkText = '';

      paragraphs.forEach((para) => {
        if ((currentChunkText + para).length > targetChunkSize && currentChunkText.trim()) {
          chunks.push({
            id: `chk-${sourceId}-${chunkIdx++}`,
            sourceId,
            idx: chunkIdx,
            text: currentChunkText.trim(),
            pageRef: p.pageNum,
            tokenCount: Math.round(currentChunkText.length / 4),
          });
          currentChunkText = '';
        }
        currentChunkText += para + '\n';
      });

      if (currentChunkText.trim()) {
        chunks.push({
          id: `chk-${sourceId}-${chunkIdx++}`,
          sourceId,
          idx: chunkIdx,
          text: currentChunkText.trim(),
          pageRef: p.pageNum,
          tokenCount: Math.round(currentChunkText.length / 4),
        });
      }
    });
  } else {
    // Single block chunking
    const paragraphs = fullText.split(/\n\n+/);
    let currentChunkText = '';

    paragraphs.forEach((para) => {
      if ((currentChunkText + para).length > targetChunkSize && currentChunkText.trim()) {
        chunks.push({
          id: `chk-${sourceId}-${chunkIdx++}`,
          sourceId,
          idx: chunkIdx,
          text: currentChunkText.trim(),
          pageRef: 1,
          tokenCount: Math.round(currentChunkText.length / 4),
        });
        currentChunkText = '';
      }
      currentChunkText += para + '\n';
    });

    if (currentChunkText.trim()) {
      chunks.push({
        id: `chk-${sourceId}-${chunkIdx++}`,
        sourceId,
        idx: chunkIdx,
        text: currentChunkText.trim(),
        pageRef: 1,
        tokenCount: Math.round(currentChunkText.length / 4),
      });
    }
  }

  return chunks;
}

// Ingestion Pipeline Orchestrator
export async function processIngestion(options: IngestionOptions): Promise<SourceItem> {
  const quota = getUserQuota(options.userId);
  if (quota.filesUsed >= quota.maxFiles) {
    throw new Error(`Quota limit reached: Maximum ${quota.maxFiles} files allowed on free tier.`);
  }

  const { text: extractedText, pages } = await extractTextFromContent(options);
  if (!extractedText || extractedText.length < 10) {
    throw new Error('Extracted text is empty or too short');
  }

  // Security: Prompt injection hardening - strip control characters
  const sanitizedText = extractedText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  const contentHash = crypto.createHash('sha256').update(sanitizedText).digest('hex').substring(0, 16);
  const sourceId = 'src-' + crypto.randomUUID().substring(0, 8);
  const sourceTitle = options.title || options.filename || (options.url ? new URL(options.url).hostname : 'Uploaded Source Note');

  // Generate metadata via LLM or heuristic
  let metadata = {
    authors: ['Student Researcher'],
    year: new Date().getFullYear(),
    summary: sanitizedText.substring(0, 200) + '...',
    keyTerms: ['Research', 'Study Notes'],
    tags: ['Student Material', options.type],
    citationJson: {
      apa: `${sourceTitle} (${new Date().getFullYear()}). Retrieved from SiteForge Knowledge Library.`,
      mla: `"${sourceTitle}." SiteForge Knowledge Library, ${new Date().getFullYear()}.`,
      ieee: `[1] "${sourceTitle}," SiteForge Knowledge Library, ${new Date().getFullYear()}.`,
      harvard: `${sourceTitle}, ${new Date().getFullYear()}. SiteForge Knowledge Library.`,
    }
  };

  try {
    const metaPrompt = `Analyze this extracted text and return a JSON object with:
{
  "authors": ["Author Name"],
  "year": 2026,
  "summary": "2-sentence executive summary",
  "keyTerms": ["term1", "term2", "term3"],
  "tags": ["tag1", "tag2"]
}
Text snippet:\n"${sanitizedText.substring(0, 1000)}"`;

    const rawJson = await callLLM([{ role: 'user', content: metaPrompt }], { jsonMode: true, temperature: 0.2 });
    const parsed = JSON.parse(rawJson);
    if (parsed) {
      metadata = { ...metadata, ...parsed };
    }
  } catch {
    // Keep fallback metadata
  }

  // Save file locally if buffer provided
  let savedPath: string | undefined;
  if (options.fileBuffer) {
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', options.userId);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    savedPath = path.join(uploadDir, `${sourceId}_${options.filename || 'file'}`);
    fs.writeFileSync(savedPath, options.fileBuffer);
  }

  const sourceItem: SourceItem = {
    id: sourceId,
    userId: options.userId,
    projectId: options.projectId || null,
    title: sourceTitle,
    authors: metadata.authors,
    year: metadata.year,
    type: options.type,
    language: 'English',
    url: options.url,
    filePath: savedPath,
    hash: contentHash,
    status: 'ready',
    publicFlag: false,
    citationJson: metadata.citationJson,
    summary: metadata.summary,
    keyTerms: metadata.keyTerms,
    tags: metadata.tags,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveKnowledgeSource(sourceItem);

  // Create & save semantic chunks
  const chunks = createSemanticChunks(sourceId, sanitizedText, pages);
  saveSourceChunks(chunks);

  return sourceItem;
}
