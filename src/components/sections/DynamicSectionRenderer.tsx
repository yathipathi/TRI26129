'use client';

import React from 'react';
import { Section } from '@/types';
import { NavbarSection } from './NavbarSection';
import { HeroSection } from './HeroSection';
import { AuthSection } from './AuthSection';
import { DashboardSection } from './DashboardSection';
import { GallerySection } from './GallerySection';
import { BlogSection } from './BlogSection';
import { StatsSection } from './StatsSection';
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';
import { PricingSection } from './PricingSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { FooterSection } from './FooterSection';
import { ContactSection } from './ContactSection';
import { 
  FlashcardsSection,
  QuizSection,
  GlossarySection,
  TimelineSection,
  ConceptMapSection,
  BibliographySection
} from './StudentSections';
import { 
  ArrowUp, ArrowDown, Sparkles, Trash2, Edit3, Copy, Plus
} from 'lucide-react';

interface DynamicSectionRendererProps {
  section: Section;
  index: number;
  totalSections: number;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, itemIndex?: number, subfield?: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onDelete?: (index: number) => void;
  onDuplicate?: (index: number) => void;
  onOpenEditModal?: (section: Section, index: number) => void;
  onOpenRegenModal?: (section: Section, index: number) => void;
  onOpenAddModal?: (insertIndex: number) => void;
  onNavigatePage?: (target: string) => void;
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({
  section,
  index,
  totalSections,
  isEditable = true,
  onUpdateText,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  onOpenEditModal,
  onOpenRegenModal,
  onOpenAddModal,
  onNavigatePage,
}) => {
  const renderContent = () => {
    const props = {
      section,
      isEditable,
      onUpdateText: (field: string, val: string, i?: number, sub?: string) =>
        onUpdateText?.(field, val, i, sub),
      onNavigatePage,
    };

    switch (section.type) {
      case 'navbar':
        return <NavbarSection {...props} />;
      case 'hero':
        return <HeroSection {...props} />;
      case 'auth':
        return <AuthSection {...props} />;
      case 'dashboard':
        return <DashboardSection {...props} />;
      case 'gallery':
        return <GallerySection {...props} />;
      case 'blog':
        return <BlogSection {...props} />;
      case 'stats':
        return <StatsSection {...props} />;
      case 'features':
        return <FeaturesSection {...props} />;
      case 'testimonials':
        return <TestimonialsSection {...props} />;
      case 'pricing':
        return <PricingSection {...props} />;
      case 'faq':
        return <FAQSection {...props} />;
      case 'cta':
        return <CTASection {...props} />;
      case 'footer':
        return <FooterSection {...props} />;
      case 'contact':
        return <ContactSection {...props} />;
      case 'flashcards':
        return <FlashcardsSection {...props} />;
      case 'quiz':
        return <QuizSection {...props} />;
      case 'glossary':
        return <GlossarySection {...props} />;
      case 'timeline':
        return <TimelineSection {...props} />;
      case 'concept-map':
        return <ConceptMapSection {...props} />;
      case 'bibliography':
        return <BibliographySection {...props} />;
      default:
        return (
          <div className="py-12 px-6 border-b-2 border-black bg-white text-center">
            <h3 className="text-xl font-bold uppercase">{section.title}</h3>
            <p className="text-sm text-neutral-600">{section.subtitle}</p>
          </div>
        );
    }
  };

  return (
    <div className="relative group/section transition-all">
      {/* Visual Section Control Toolbar on hover */}
      {isEditable && (
        <div className="absolute top-3 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center divide-x divide-black">
          <button
            title="Move Up"
            disabled={index === 0}
            onClick={() => onMoveUp?.(index)}
            className="p-2 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white text-black transition-colors"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          
          <button
            title="Move Down"
            disabled={index === totalSections - 1}
            onClick={() => onMoveDown?.(index)}
            className="p-2 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-white text-black transition-colors"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          <button
            title="AI Regenerate Section"
            onClick={() => onOpenRegenModal?.(section, index)}
            className="p-2 hover:bg-neutral-100 text-black flex items-center gap-1 text-xs font-mono font-bold px-2.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI REGEN</span>
          </button>

          <button
            title="Edit Section Details"
            onClick={() => onOpenEditModal?.(section, index)}
            className="p-2 hover:bg-neutral-100 text-black flex items-center gap-1 text-xs font-mono font-bold px-2.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>EDIT</span>
          </button>

          <button
            title="Visual Inspector & Compound Extractor"
            onClick={() => onOpenEditModal?.(section, index)}
            className="p-2 hover:bg-neutral-100 text-black flex items-center gap-1 text-xs font-mono font-bold px-2.5 transition-colors"
          >
            <span>INSPECT</span>
          </button>

          <button
            title="Duplicate Section"
            onClick={() => onDuplicate?.(index)}
            className="p-2 hover:bg-neutral-100 text-black transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            title="Add Section Below"
            onClick={() => onOpenAddModal?.(index + 1)}
            className="p-2 hover:bg-neutral-100 text-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            title="Delete Section"
            onClick={() => onDelete?.(index)}
            className="p-2 hover:bg-black hover:text-white text-black transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Section Badge Tag */}
      {isEditable && (
        <div className="absolute top-3 left-4 z-20 opacity-0 group-hover/section:opacity-100 transition-opacity bg-black text-white px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
          {section.type} [#{index + 1}]
        </div>
      )}

      {/* Render Component */}
      {renderContent()}
    </div>
  );
};
