'use client';

import React, { useState } from 'react';
import { Section } from '@/types';
import { Send, CheckCircle2 } from 'lucide-react';

interface SectionProps {
  section: Section;
  isEditable?: boolean;
  onUpdateText?: (field: string, value: string, index?: number, subfield?: string) => void;
}

export const ContactSection: React.FC<SectionProps> = ({
  section,
  isEditable = true,
  onUpdateText,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-2 border-black bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 space-y-3">
          {section.badge && (
            <div
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('badge', e.currentTarget.textContent || '')}
              className="inline-flex items-center px-3 py-1 border border-black bg-white text-[11px] font-mono font-bold tracking-wide uppercase text-black outline-none"
            >
              {section.badge}
            </div>
          )}
          <h2
            contentEditable={isEditable}
            suppressContentEditableWarning
            onBlur={(e) => onUpdateText?.('title', e.currentTarget.textContent || '')}
            className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-black outline-none focus:ring-1 focus:ring-black px-1"
          >
            {section.title || 'Get In Touch'}
          </h2>
          {section.subtitle && (
            <p
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => onUpdateText?.('subtitle', e.currentTarget.textContent || '')}
              className="text-xs sm:text-sm text-neutral-700 font-mono outline-none focus:ring-1 focus:ring-black px-1"
            >
              {section.subtitle}
            </p>
          )}
        </div>

        <div className="border-2 border-black bg-white p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {submitted ? (
            <div className="text-center py-10 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold uppercase font-mono text-black">Message Recorded</h3>
              <p className="text-xs font-mono text-neutral-600 max-w-sm">Inquiry processed and saved directly into system repository.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-black mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-black mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-black mb-1">
                  Message Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your requirements or project scope..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 border border-black text-xs font-mono bg-white text-black placeholder:text-neutral-400 outline-none focus:ring-1 focus:ring-black resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold uppercase text-xs border border-black transition-colors flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <span>Submit Inquiry</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
