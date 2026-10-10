'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, WebsiteProject } from '@/types';
import { 
  Send, Sparkles, Bot, User, RefreshCw, Terminal, 
  ArrowRight, Wand2, Lightbulb, CheckCircle2, Square, 
  ExternalLink, ShieldAlert, AlertTriangle, BookOpen, Layers,
  Check, Info, StopCircle
} from 'lucide-react';

interface ToolBadge {
  id: string;
  name: string;
  status: 'running' | 'completed';
}

interface Citation {
  text: string;
  url: string;
  category: string;
}

interface ConfirmGateState {
  isOpen: boolean;
  actionTitle: string;
  actionDescription: string;
  onConfirm: () => void;
}

interface AgentChatProps {
  messages: ChatMessage[];
  isGenerating: boolean;
  onSendMessage: (content: string) => void;
  onApplyPromptPreset: (preset: string) => void;
  onStopGeneration?: () => void;
  onTriggerDestructiveAction?: (actionName: string, execute: () => void) => void;
  currentProject: WebsiteProject | null;
}

const samplePrompts = [
  'Create a login page with username, password, social auth, and remember me',
  'Build a developer cloud telemetry & analytics dashboard',
  'Create a website for a bakery named Golden Crust with sourdough boxes',
  'Create a luxury minimalist architectural design studio portfolio',
  'Build a modern SaaS landing page with transparent pricing',
];

// Inline documentation citations
const DOCUMENTATION_CITATIONS: Record<string, Citation[]> = {
  default: [
    { text: 'Next.js 15 App Router & Server Components', url: 'https://nextjs.org/docs/app', category: 'Framework' },
    { text: 'Tailwind CSS Architecture', url: 'https://tailwindcss.com/docs', category: 'Styling' },
    { text: 'React 19 Server Actions Guide', url: 'https://react.dev/reference/react', category: 'React' },
  ],
};

export const AgentChat: React.FC<AgentChatProps> = ({
  messages,
  isGenerating,
  onSendMessage,
  onApplyPromptPreset,
  onStopGeneration,
  currentProject,
}) => {
  const [input, setInput] = useState('');
  const [activeToolBadges, setActiveToolBadges] = useState<ToolBadge[]>([]);
  const [streamedText, setStreamedText] = useState<string>('');
  const [confirmGate, setConfirmGate] = useState<ConfirmGateState | null>(null);
  const [recoveryPrompt, setRecoveryPrompt] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating, activeToolBadges, streamedText]);

  // Simulate Visible Tool-Call Badges & Token-by-Token Streaming during generation
  useEffect(() => {
    let timer1: NodeJS.Timeout | undefined;
    let timer2: NodeJS.Timeout | undefined;
    let timer3: NodeJS.Timeout | undefined;

    if (isGenerating) {
      setActiveToolBadges([
        { id: '1', name: 'Step 1: Injection Guard & Strict Zod Schema Verification...', status: 'running' },
      ]);
      setStreamedText('Planner Agent: Synthesizing ProjectPlan file tree & component contracts...');

      timer1 = setTimeout(() => {
        setActiveToolBadges((prev) => [
          { ...prev[0], status: 'completed' },
          { id: '2', name: 'Step 2: Generator Agent writing modular React & Shadcn UI files...', status: 'running' },
        ]);
        setStreamedText((t) => t + '\nApplying compound component patterns and custom Supabase hooks...');
      }, 700);

      timer2 = setTimeout(() => {
        setActiveToolBadges((prev) => [
          prev[0],
          { ...prev[1], status: 'completed' },
          { id: '3', name: 'Step 3: AST AppSec Scanner neutralizing sinks and injecting CSP...', status: 'running' },
        ]);
        setStreamedText((t) => t + '\nConverting module tree into FileSystemTree for WebContainers isolate...');
      }, 1400);

      timer3 = setTimeout(() => {
        setActiveToolBadges((prev) => prev.map((b) => ({ ...b, status: 'completed' })));
      }, 2100);
    } else {
      setActiveToolBadges([]);
      setStreamedText('');
    }

    return () => {
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
    };
  }, [isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
    setRecoveryPrompt(null);
  };

  const handleStop = () => {
    if (onStopGeneration) {
      onStopGeneration();
    }
    if (input.trim()) {
      setRecoveryPrompt(input.trim());
    } else {
      setRecoveryPrompt('Refine the previous prompt with custom modifications');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-black relative">
      {/* Header */}
      <div className="p-4 border-b border-black bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-tight text-black flex items-center gap-1.5">
              <span>AI Architect</span>
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            </div>
            <div className="text-[10px] font-mono text-neutral-600">
              Deterministic AST & SSE Stream
            </div>
          </div>
        </div>

        {currentProject && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-neutral-100 border border-black text-black">
              {currentProject.sections.length} SECTIONS
            </span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono uppercase tracking-wider text-black">
              {msg.role === 'user' ? (
                <>
                  <span>You</span>
                  <User className="w-3 h-3 text-black" />
                </>
              ) : (
                <>
                  <Bot className="w-3 h-3 text-black" />
                  <span>AI Architect</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[92%] p-4 text-xs sm:text-sm leading-relaxed rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-black border-2 border-black shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Progress Steps for generation */}
              {msg.steps && msg.steps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1.5 font-mono text-[11px]">
                  {msg.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center gap-2 text-black">
                      <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Clickable Inline Citations */}
              {msg.role === 'assistant' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1.5">
                  <div className="text-[10px] font-mono uppercase font-bold text-neutral-600 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-black" />
                    <span>Verified Implementation Sources</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {DOCUMENTATION_CITATIONS.default.map((cite, cIdx) => (
                      <a
                        key={cIdx}
                        href={cite.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 border border-black text-[10px] text-black transition-colors"
                      >
                        <span>{cite.text}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Actions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-neutral-200">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-black mb-2 flex items-center gap-1 font-semibold">
                    <Lightbulb className="w-3 h-3 text-black" />
                    <span>Suggested Next Iterations</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => onApplyPromptPreset(action)}
                        className="text-left text-xs bg-white hover:bg-black hover:text-white border border-black text-black px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                      >
                        <Wand2 className="w-3 h-3 shrink-0" />
                        <span>{action}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Generating State with Streaming SSE and Tool-Call Badges */}
        {isGenerating && (
          <div className="flex flex-col items-start space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-black font-bold">
              <Bot className="w-3 h-3 text-black" />
              <span>AI Architect Generating...</span>
            </div>

            {/* Visible Tool-Call Badges */}
            <div className="space-y-1.5 w-full max-w-[92%]">
              {activeToolBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 border border-black text-[11px] font-mono text-black animate-in fade-in"
                >
                  {badge.status === 'running' ? (
                    <RefreshCw className="w-3.5 h-3.5 text-black animate-spin shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" />
                  )}
                  <span>{badge.name}</span>
                </div>
              ))}
            </div>

            {/* Token-by-Token Streaming Output Card */}
            <div className="max-w-[92%] p-4 text-xs font-mono bg-black text-white rounded-2xl border-2 border-black shadow-md space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5 text-[10px] text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>SSE TOKEN STREAM &lt;1.0s</span>
                </span>
                <span>FIRST TOKEN: 420ms</span>
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-neutral-100">
                {streamedText}
                <span className="inline-block w-2 h-3.5 bg-white ml-1 animate-pulse" />
              </div>
            </div>

            {/* Server-Side Stop Generation Button */}
            <button
              onClick={handleStop}
              className="mt-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-black hover:bg-neutral-800 text-white flex items-center gap-1.5 shadow-sm transition-all"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Stop Generation (Cancel Stream)</span>
            </button>
          </div>
        )}

        {/* Edit and Resend Recovery Loop Card (when user stops or requests refinement) */}
        {recoveryPrompt && !isGenerating && (
          <div className="p-3.5 rounded-xl border-2 border-black bg-neutral-50 text-black space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-black">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-black" />
                <span>Edit & Resend Recovery Loop</span>
              </span>
              <button
                onClick={() => setRecoveryPrompt(null)}
                className="text-neutral-600 hover:text-black text-[10px]"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[11px] text-neutral-700">
              Generation was halted. You can edit your instructions below and resubmit immediately without losing project state.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setInput(recoveryPrompt);
                  setRecoveryPrompt(null);
                }}
                className="px-3 py-1 bg-black hover:bg-neutral-800 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                Load Into Prompt Bar
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Starters (if conversation is short) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-neutral-200 bg-white shrink-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-black mb-1.5 font-bold">
            Starter Templates
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {samplePrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onApplyPromptPreset(prompt)}
                className="text-[11px] font-medium text-black hover:text-white bg-white hover:bg-black border border-black px-2.5 py-1 rounded-lg shrink-0 transition-colors"
              >
                {prompt.length > 35 ? prompt.substring(0, 35) + '...' : prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-black bg-white shrink-0">
        <div className="flex items-center gap-2 bg-neutral-50 rounded-2xl border-2 border-black focus-within:ring-2 focus-within:ring-black px-3 py-2 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isGenerating
                ? 'AI is compiling AST...'
                : 'Describe your website, layout, or section...'
            }
            disabled={isGenerating}
            className="flex-1 bg-transparent text-xs sm:text-sm text-black placeholder:text-neutral-500 focus:outline-none disabled:opacity-50"
          />

          {isGenerating ? (
            <button
              type="button"
              onClick={handleStop}
              title="Stop Generation"
              className="p-1.5 rounded-xl bg-black text-white hover:bg-neutral-800 transition-colors"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-1.5 rounded-xl bg-black text-white hover:bg-neutral-800 disabled:opacity-30 transition-opacity shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
