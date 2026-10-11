import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function AcademicIntegrityPage() {
  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-md-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to SiteForge</span>
      </Link>

      <div className="space-y-3 border-b border-md-outline-variant/40 pb-6">
        <div className="flex items-center gap-2 text-md-primary font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-5 h-5" />
          <span>Student Policy</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Academic Integrity & Citations</h1>
        <p className="text-sm text-md-on-surface-variant">Last updated: October 11, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-md-on-surface leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold">1. Source-Grounded Content Generation</h2>
          <p>
            The SiteForge Knowledge Library parses student notes, research papers, and textbooks to construct educational websites, flashcards, and summary pages. Generated facts are strictly linked to uploaded sources with inline citations (`[1]`, `[2]`).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold">2. Anti-Hallucination Safeguards</h2>
          <p>
            When uploaded source material lacks sufficient information to answer a topic, SiteForge displays explicit "Not found in your sources" tags rather than inventing ungrounded claims.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold">3. Transparent Attribution</h2>
          <p>
            Students and educators can inspect claim citations, source snippets, and page numbers at any time using the Evidence Panel inside the workspace studio.
          </p>
        </section>
      </div>
    </div>
  );
}
