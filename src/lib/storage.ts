import fs from 'fs';
import path from 'path';
import { generateFullProjectDocumentation } from './project-doc-generator';

export interface GeneratedSiteMeta {
  siteId: string;
  name: string;
  type: string;
  templateSlug?: string;
  prompt: string;
  createdAt: number;
  files: string[];
  sources: { title: string; url: string; snippet?: string }[];
  brief?: any;
}

const STORAGE_DIR = path.join(process.cwd(), 'generated');
const INDEX_FILE = path.join(STORAGE_DIR, 'index.json');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function saveSiteFiles(siteId: string, files: Record<string, string>, meta: Omit<GeneratedSiteMeta, 'siteId' | 'createdAt' | 'files'>): GeneratedSiteMeta {
  ensureDir(STORAGE_DIR);
  const siteDir = path.join(STORAGE_DIR, siteId);
  ensureDir(siteDir);

  const fileNames: string[] = [];
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(siteDir, relativePath);
    ensureDir(path.dirname(fullPath));
    fs.writeFileSync(fullPath, content, 'utf-8');
    fileNames.push(relativePath);
  }

  // Automatically synthesize academic thesis & documentation dossier for every created project
  try {
    const docFiles = generateFullProjectDocumentation({
      title: meta.name || 'Generated Website',
      id: siteId,
      category: meta.type || 'Web Application',
      prompt: meta.prompt || '',
      pages: fileNames.filter((f) => f.endsWith('.html')).map((f) => ({
        slug: f,
        title: f.replace('.html', '').replace(/^\w/, (c) => c.toUpperCase()),
      })),
      sources: meta.sources || [],
      createdAt: Date.now(),
    });

    for (const [docRelPath, docContent] of Object.entries(docFiles)) {
      const fullPath = path.join(siteDir, docRelPath);
      ensureDir(path.dirname(fullPath));
      fs.writeFileSync(fullPath, docContent, 'utf-8');
      if (!fileNames.includes(docRelPath)) {
        fileNames.push(docRelPath);
      }
    }
  } catch (err) {
    console.warn('Doc generation warning in saveSiteFiles:', err);
  }

  const siteMeta: GeneratedSiteMeta = {
    siteId,
    createdAt: Date.now(),
    files: fileNames,
    ...meta,
  };

  // Update Index
  let index: Record<string, GeneratedSiteMeta> = {};
  if (fs.existsSync(INDEX_FILE)) {
    try {
      index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    } catch {
      index = {};
    }
  }
  index[siteId] = siteMeta;
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');

  return siteMeta;
}

export function getSiteMeta(siteId: string): GeneratedSiteMeta | null {
  if (!fs.existsSync(INDEX_FILE)) return null;
  try {
    const index: Record<string, GeneratedSiteMeta> = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    return index[siteId] || null;
  } catch {
    return null;
  }
}

export function getSiteFile(siteId: string, filePath: string = 'index.html'): { content: string; mimeType: string } | null {
  const cleanPath = filePath.replace(/^\/+/, '') || 'index.html';
  const fullPath = path.join(STORAGE_DIR, siteId, cleanPath);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  let mimeType = 'text/html';
  if (cleanPath.endsWith('.css')) mimeType = 'text/css';
  else if (cleanPath.endsWith('.js')) mimeType = 'text/javascript';
  else if (cleanPath.endsWith('.json')) mimeType = 'application/json';
  else if (cleanPath.endsWith('.png')) mimeType = 'image/png';
  else if (cleanPath.endsWith('.jpg') || cleanPath.endsWith('.jpeg')) mimeType = 'image/jpeg';
  else if (cleanPath.endsWith('.svg')) mimeType = 'image/svg+xml';

  return { content, mimeType };
}

export function getSiteDirectory(siteId: string): string | null {
  const siteDir = path.join(STORAGE_DIR, siteId);
  if (!fs.existsSync(siteDir)) return null;
  return siteDir;
}
