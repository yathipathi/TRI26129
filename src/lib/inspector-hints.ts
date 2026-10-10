import { SectionSpec } from '@/types';

export interface InspectorHint {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  field?: string;
}

// Compute real-time quality hints for a section
export function computeInspectorHints(section: SectionSpec | any): InspectorHint[] {
  const hints: InspectorHint[] = [];
  if (!section) return hints;

  const props = section.props || {};
  const title = props.title || section.title || '';
  const subtitle = props.subtitle || section.subtitle || '';

  // 1. Heading Length Check
  if (title.length > 65) {
    hints.push({
      id: 'h-length',
      type: 'warning',
      message: 'Title heading is over 65 characters long. Consider shortening for better mobile readability.',
      field: 'title',
    });
  }

  // 2. Alt Text Check
  const image = props.image || props.heroImage || props.avatar;
  const alt = props.alt || props.imageAlt;
  if (image && (!alt || !alt.trim()) && !props.isDecorative) {
    hints.push({
      id: 'h-alt',
      type: 'error',
      message: 'Image is missing accessible alt text. Required for WCAG 2.2 AA compliance.',
      field: 'alt',
    });
  }

  // 3. Low Contrast / Dark background hints
  if (props.customCss && props.customCss.includes('color: #ffffff') && !props.customCss.includes('background')) {
    hints.push({
      id: 'h-contrast',
      type: 'warning',
      message: 'White text set without explicit dark background color. Verify contrast ratio.',
      field: 'customCss',
    });
  }

  // 4. Reading Level Indicator
  const fullText = `${title} ${subtitle}`;
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount > 10) {
    const avgWordLen = fullText.length / wordCount;
    if (avgWordLen > 6.5) {
      hints.push({
        id: 'h-reading',
        type: 'info',
        message: `Reading Level: Advanced / Academic (~${Math.round(avgWordLen * 1.5)}th grade reading level).`,
      });
    }
  }

  return hints;
}
