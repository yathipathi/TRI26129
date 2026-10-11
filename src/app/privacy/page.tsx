import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface font-sans p-6 md:p-12 max-w-4xl mx-auto space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-md-primary hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to SiteForge</span>
      </Link>

      <div className="space-y-3 border-b border-md-outline-variant/40 pb-6">
        <div className="flex items-center gap-2 text-md-primary font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5" />
          <span>Privacy & Data Policy</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-md-on-surface-variant">Last updated: October 11, 2026</p>
      </div>

      <div className="space-y-6 text-sm text-md-on-surface leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold">1. Data Storage & Privacy Protection</h2>
          <p>
            SiteForge operates locally on your machine or private cloud server instance. Project specifications, uploaded Knowledge Library documents, and site versions remain private to your workspace account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold">2. External AI & Web Research Services</h2>
          <p>
            When performing AI generation or web research, non-sensitive prompt requests are sent via encrypted HTTPS APIs to Groq, OpenRouter, or Tavily search endpoints. Uploaded student notes and raw files are processed locally and never sold or shared with external data brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold">3. No Tracking Cookies</h2>
          <p>
            SiteForge does not use invasive third-party tracking cookies or advertising pixels. Authentication cookies are strictly necessary session tokens used solely for account authorization.
          </p>
        </section>
      </div>
    </div>
  );
}
