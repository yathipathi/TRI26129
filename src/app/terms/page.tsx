import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-md-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to SiteForge</span>
      </Link>

      <div className="space-y-3 border-b border-md-outline-variant/40 pb-6">
        <div className="flex items-center gap-2 text-md-primary font-bold text-xs uppercase tracking-wider">
          <FileText className="w-5 h-5" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-md-on-surface-variant">Last updated: October 11, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-md-on-surface leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold">1. Code & Asset Ownership</h2>
          <p>
            You retain 100% full ownership of all website code, specifications, copy, and exported ZIP packages generated using SiteForge. SiteForge imposes zero vendor lock-in and zero royalty fees.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold">2. Responsible Usage</h2>
          <p>
            You agree not to use SiteForge to generate phishing pages, malicious scripts, illegal content, or deceptive malware. Generated sites undergo automated security scanning for script safety.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold">3. Service Disclaimers</h2>
          <p>
            SiteForge provides website generation and Playwright verification tools "as is". Users are encouraged to review final human approval checklists before publishing exported code to production web hosts.
          </p>
        </section>
      </div>
    </div>
  );
}
