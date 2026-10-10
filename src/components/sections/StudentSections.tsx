'use client';

import React, { useState } from 'react';
import { Section, SectionItem } from '@/types';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Quote,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

interface StudentSectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, val: string, i?: number, sub?: string) => void;
}

// -----------------------------------------------------------------------------------------
// 1. FLASHCARDS COMPONENT
// -----------------------------------------------------------------------------------------
export const FlashcardsSection: React.FC<StudentSectionProps> = ({ section }) => {
  const items = section.items || [
    { id: '1', front: 'What is RAG (Retrieval-Augmented Generation)?', back: 'A technique that grounds LLM responses on specific retrieved documents to prevent hallucinations.', category: 'AI Concepts' },
    { id: '2', front: 'What is BM25?', back: 'A bag-of-words retrieval function that ranks documents based on query terms appearing in each document.', category: 'Information Retrieval' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());

  const currentCard = items[currentIndex] || items[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const toggleKnown = (id: string) => {
    const next = new Set(knownIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setKnownIds(next);
  };

  return (
    <section className="py-12 px-6 bg-surface surface-container-low text-foreground border-b border-outline/10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          {section.badge && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
              {section.badge}
            </span>
          )}
          <h2 className="text-2xl font-bold">{section.title || 'Interactive Flashcards'}</h2>
          {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
        </div>

        {/* Progress Tally */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
          <span>Card {currentIndex + 1} of {items.length}</span>
          <span>Mastered: <strong className="text-emerald-500">{knownIds.size}</strong> / {items.length}</span>
        </div>

        {/* Flip Card Container */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative h-64 w-full cursor-pointer perspective-1000 group"
        >
          <div
            className={`w-full h-full rounded-2xl border-2 border-outline/20 p-8 flex flex-col items-center justify-center text-center shadow-lg transition-transform duration-500 transform-style-3d bg-surface ${
              isFlipped ? 'rotate-y-180 bg-primary/5 border-primary/40' : 'hover:border-primary/50'
            }`}
          >
            {!isFlipped ? (
              <div className="space-y-4">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-widest">
                  {currentCard.category || 'Front'}
                </span>
                <p className="text-lg md:text-xl font-semibold text-foreground">
                  {currentCard.front || currentCard.title}
                </p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" /> Click to flip answer
                </p>
              </div>
            ) : (
              <div className="space-y-4 transform rotate-y-180">
                <span className="text-xs font-mono uppercase text-primary font-bold tracking-widest">
                  Answer / Explanation
                </span>
                <p className="text-base text-foreground leading-relaxed">
                  {currentCard.back || currentCard.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-xl border border-outline/20 hover:bg-surface-variant text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => toggleKnown(currentCard.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 border ${
              knownIds.has(currentCard.id)
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                : 'border-outline/20 text-muted-foreground hover:bg-surface-variant'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            {knownIds.has(currentCard.id) ? 'Mastered' : 'Mark as Known'}
          </button>

          <button
            onClick={handleNext}
            className="p-2.5 rounded-xl border border-outline/20 hover:bg-surface-variant text-muted-foreground hover:text-foreground transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------------------
// 2. QUIZ COMPONENT
// -----------------------------------------------------------------------------------------
export const QuizSection: React.FC<StudentSectionProps> = ({ section }) => {
  const items = section.items || [
    {
      id: 'q1',
      question: 'Which index type is best for keyword BM25 text retrieval in offline SQLite?',
      options: ['FTS5 / Full-Text Search', 'B-Tree', 'R-Tree', 'Hash Index'],
      correctIndex: 0,
      explanation: 'SQLite FTS5 provides fast full-text indexing and BM25 ranking built-in.',
    },
  ];

  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const handleSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIndex });
  };

  return (
    <section className="py-12 px-6 bg-background text-foreground border-b border-outline/10">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
            Self Check Quiz
          </span>
          <h2 className="text-2xl font-bold">{section.title || 'Knowledge Self-Assessment'}</h2>
        </div>

        <div className="space-y-6">
          {items.map((item, qIdx) => {
            const selected = selectedAnswers[item.id];
            const isAnswered = selected !== undefined;
            const isCorrect = selected === item.correctIndex;

            return (
              <div key={item.id} className="bg-surface border border-outline/20 rounded-2xl p-6 space-y-4 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-base text-foreground flex items-start gap-2">
                    <span className="text-primary font-mono font-bold">{qIdx + 1}.</span>
                    {item.question || item.title}
                  </h3>
                  {isAnswered && (
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-error/10 text-error'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {(item.options || []).map((opt, oIdx) => {
                    let btnStyle = 'bg-surface-variant/30 border-outline/20 hover:border-outline/50 text-foreground';
                    if (isAnswered) {
                      if (oIdx === item.correctIndex) {
                        btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-500 font-semibold';
                      } else if (selected === oIdx) {
                        btnStyle = 'bg-error/15 border-error text-error font-semibold';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelect(item.id, oIdx)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {isAnswered && oIdx === item.correctIndex && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {isAnswered && selected === oIdx && oIdx !== item.correctIndex && <XCircle className="w-4 h-4 text-error" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && item.explanation && (
                  <div className="p-3 bg-surface-variant/40 rounded-xl text-xs text-muted-foreground border border-outline/10 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item.explanation}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------------------
// 3. GLOSSARY COMPONENT
// -----------------------------------------------------------------------------------------
export const GlossarySection: React.FC<StudentSectionProps> = ({ section }) => {
  const items = section.items || [
    { id: '1', title: 'BM25', description: 'Best Matching 25 term frequency ranking algorithm used in search engines.', sourceId: 'src-1', pageRef: 'Page 12' },
    { id: '2', title: 'Vector Embedding', description: 'Dense mathematical vector representation capturing semantic meaning of text.', sourceId: 'src-2', pageRef: 'Page 4' },
  ];

  const [filter, setFilter] = useState('');

  const filtered = items.filter((i) =>
    (i.title || '').toLowerCase().includes(filter.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <section className="py-12 px-6 bg-surface border-b border-outline/10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">{section.title || 'Course Glossary & Key Terms'}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Auto-linked definitions with source page citations</p>
          </div>
          <input
            type="text"
            placeholder="Filter terms..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-variant/40 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-background border border-outline/20 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                {item.pageRef && (
                  <span className="text-[11px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {item.pageRef}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------------------
// 4. TIMELINE COMPONENT
// -----------------------------------------------------------------------------------------
export const TimelineSection: React.FC<StudentSectionProps> = ({ section }) => {
  const items = section.items || [
    { id: '1', date: 'Phase 1', title: 'Data Ingestion & Chunking', description: 'Raw document parsing and magic byte validation.' },
    { id: '2', date: 'Phase 2', title: 'Hybrid Retrieval & RAG', description: 'Combining BM25 keyword search with vector embeddings.' },
  ];

  return (
    <section className="py-12 px-6 bg-background border-b border-outline/10">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-center">{section.title || 'Chronological Timeline'}</h2>
        <div className="relative border-l-2 border-primary/30 ml-4 space-y-8 pl-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
              <span className="text-xs font-mono font-semibold text-primary">{item.date}</span>
              <h3 className="text-base font-bold text-foreground mt-0.5">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------------------
// 5. CONCEPT MAP COMPONENT (SVG Node Graph)
// -----------------------------------------------------------------------------------------
export const ConceptMapSection: React.FC<StudentSectionProps> = ({ section }) => {
  const items = section.items || [
    { id: 'n1', title: 'Source Documents', category: 'Input' },
    { id: 'n2', title: 'Text Extraction & Chunks', category: 'Processing' },
    { id: 'n3', title: 'RAG Grounded AI Output', category: 'Output' },
  ];

  return (
    <section className="py-12 px-6 bg-surface surface-container-low border-b border-outline/10">
      <div className="max-w-4xl mx-auto space-y-6 text-center">
        <h2 className="text-xl font-bold">{section.title || 'Concept Map Graph'}</h2>
        <p className="text-xs text-muted-foreground">{section.subtitle || 'Visual diagram of relationships'}</p>

        <div className="flex flex-wrap items-center justify-center gap-4 py-8">
          {items.map((node, idx) => (
            <React.Fragment key={node.id}>
              <div className="px-5 py-4 bg-surface border-2 border-primary/40 rounded-2xl shadow-md space-y-1">
                <span className="text-[10px] font-mono uppercase text-primary font-bold">{node.category || 'Concept'}</span>
                <p className="font-semibold text-sm text-foreground">{node.title}</p>
              </div>
              {idx < items.length - 1 && (
                <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------------------
// 6. BIBLIOGRAPHY SWITCHER COMPONENT
// -----------------------------------------------------------------------------------------
export const BibliographySection: React.FC<StudentSectionProps> = ({ section }) => {
  const [style, setStyle] = useState<'apa' | 'mla' | 'ieee' | 'harvard'>('apa');

  const citations = [
    {
      apa: 'Vaswani, A. et al. (2017). Attention is all you need. Advances in Neural Information Processing Systems.',
      mla: 'Vaswani, Ashish, et al. "Attention is all you need." Advances in Neural Information Processing Systems, 2017.',
      ieee: 'A. Vaswani et al., "Attention is all you need," in Proc. NIPS, 2017.',
      harvard: 'Vaswani, A. et al. (2017) Attention is all you need. NIPS.',
    },
  ];

  return (
    <section className="py-10 px-6 bg-background border-b border-outline/10">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Quote className="w-4 h-4 text-primary" />
            {section.title || 'Source Bibliography & Citations'}
          </h3>

          <div className="flex items-center gap-1 bg-surface border border-outline/20 rounded-xl p-1 text-xs">
            {(['apa', 'mla', 'ieee', 'harvard'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-2.5 py-1 rounded-lg uppercase font-mono font-bold transition ${
                  style === s ? 'bg-primary text-on-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 font-serif text-xs text-foreground bg-surface border border-outline/20 p-4 rounded-xl">
          {citations.map((c, i) => (
            <p key={i} className="pl-6 -indent-6 leading-relaxed">
              [{i + 1}] {c[style]}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};
