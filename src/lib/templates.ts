import fs from 'fs';
import path from 'path';

export interface TemplateItem {
  slug: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  entryFile: string;
  features: string[];
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const TEMPLATES_JSON = path.join(process.cwd(), 'data', 'templates.json');

export function getAllTemplates(): TemplateItem[] {
  if (!fs.existsSync(TEMPLATES_JSON)) return [];
  try {
    const data = fs.readFileSync(TEMPLATES_JSON, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getTemplateBySlug(slug: string): TemplateItem | null {
  const templates = getAllTemplates();
  return templates.find((t) => t.slug === slug) || null;
}
