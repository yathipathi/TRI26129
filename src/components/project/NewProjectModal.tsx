'use client';

import React, { useState } from 'react';
import { 
  X, Sparkles, Plus, Wand2, Layers, ArrowRight, 
  Layout, Shield, Activity, Coffee, Building2, Terminal, Dumbbell, HeartPulse
} from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (prompt: string) => void;
  isGenerating?: boolean;
}

const TEMPLATE_PRESETS = [
  {
    id: 'saas',
    title: 'Modern SaaS Platform',
    icon: Terminal,
    description: 'AI developer tools platform with edge computing and transparent 3-tier pricing.',
    prompt: 'Create a modern SaaS landing page for an autonomous AI developer engine with edge compute and transparent pricing',
  },
  {
    id: 'auth',
    title: 'Auth & Login Portal',
    icon: Shield,
    description: 'Sign-in & registration screen with username, password, and social OAuth.',
    prompt: 'Create a login page with username, password, social auth, and remember me',
  },
  {
    id: 'dashboard',
    title: 'Telemetry & Analytics Dashboard',
    icon: Activity,
    description: 'Real-time telemetry, MRR cards, and live stream data table.',
    prompt: 'Build a developer cloud telemetry & analytics dashboard with live stream table',
  },
  {
    id: 'bakery',
    title: 'Artisanal Bakery & Cafe',
    icon: Coffee,
    description: 'Slow-fermented sourdough, morning pastry boxes, and catering.',
    prompt: 'Create a website for a bakery named Golden Crust with sourdough boxes and weekly bread subscription',
  },
  {
    id: 'portfolio',
    title: 'Minimalist Architectural Studio',
    icon: Building2,
    description: 'High-end design portfolio, category filters, and project case studies.',
    prompt: 'Create a luxury minimalist architectural design studio portfolio with project gallery',
  },
  {
    id: 'fitness',
    title: 'Fitness & Performance Gym',
    icon: Dumbbell,
    description: 'Biomarker-guided coaching, workout protocols, and membership tiers.',
    prompt: 'Create a website for a high-performance gym named Kinetic Performance with tailored coaching protocols',
  },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  isGenerating = false,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = customPrompt.trim() || (selectedTemplate 
      ? TEMPLATE_PRESETS.find(t => t.id === selectedTemplate)?.prompt 
      : 'Modern SaaS Platform');

    if (!finalPrompt) return;
    onCreateProject(finalPrompt);
    onClose();
  };

  const handleSelectTemplate = (template: typeof TEMPLATE_PRESETS[0]) => {
    setSelectedTemplate(template.id);
    setCustomPrompt(template.prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border-2 border-black overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b-2 border-black bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-black tracking-tight uppercase">
                Create New Website Project
              </h2>
              <p className="text-xs text-neutral-600">
                Choose a starter archetype or describe your concept in natural language.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-black hover:bg-neutral-100 rounded-xl transition-colors border border-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Custom Prompt Input */}
          <div>
            <label className="block text-xs font-bold text-black uppercase mb-2">
              Describe the website you want to build
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                setSelectedTemplate(null);
              }}
              placeholder="e.g. Create a website for an AI video generation studio named Lumina with pricing, video showcases, and contact form..."
              className="w-full px-4 py-3 rounded-xl border-2 border-black text-sm text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black transition-all leading-relaxed bg-white"
            />
          </div>

          {/* Preset Starter Templates */}
          <div>
            <div className="text-xs font-bold text-black uppercase mb-3 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-black" />
              <span>Or Start from a Popular Archetype Template</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATE_PRESETS.map((tmpl) => {
                const Icon = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'border-black bg-black text-white shadow-md'
                        : 'border-neutral-300 hover:border-black hover:bg-neutral-50 text-black'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                          isSelected ? 'bg-white text-black border-white' : 'bg-neutral-100 text-black border-black'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-black bg-white px-2 py-0.5 rounded-full uppercase">
                            Selected
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold mb-1">
                        {tmpl.title}
                      </h4>
                      <p className={`text-xs line-clamp-2 ${isSelected ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {tmpl.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t-2 border-black bg-neutral-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-black hover:bg-neutral-200 rounded-xl transition-colors border border-black"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!customPrompt.trim() && !selectedTemplate}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
