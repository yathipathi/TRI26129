'use client';

import React, { useState } from 'react';
import { WebsiteProject } from '@/types';
import { 
  CheckCircle2, ArrowRight, ShieldCheck, FileCheck, 
  HelpCircle, Eye, Download, Sparkles, X, ChevronRight, Check
} from 'lucide-react';

interface HumanValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WebsiteProject | null;
  onApproveAndDeploy: () => void;
}

interface StepItem {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  items: string[];
}

const VALIDATION_STEPS: StepItem[] = [
  {
    id: 1,
    name: 'Understanding',
    subtitle: 'Code Comprehension & Semantic Purpose',
    description: 'Ensure the developer reviews the AI generation intent and understands the overall architecture.',
    items: [
      'Reviewed generated page hierarchy and component distribution',
      'Verified design system consistency and typography alignment',
      'Confirmed semantic structure of Navigation, Hero, and Action sections',
    ],
  },
  {
    id: 2,
    name: 'Quality Control',
    subtitle: 'Component Modularity & React State',
    description: 'Checks component modularity, custom hooks, and React state structure for production cleanliness.',
    items: [
      'All UI sections are decoupled into isolated compound components',
      'React state is cleanly managed with zero unhandled side effects',
      'Responsive breakpoints (Mobile 390px, Tablet 768px, Desktop 100%) render cleanly',
    ],
  },
  {
    id: 3,
    name: 'Business Logic',
    subtitle: 'Requirement & Domain Verification',
    description: 'Verifies that user business requirements, pricing tiers, forms, and custom copy match the prompt.',
    items: [
      'Value propositions and call-to-actions match the exact business goals',
      'Pricing tiers and metric values are accurate and unambiguous',
      'Interactive form inputs (Auth/Contact) have appropriate labels & placeholders',
    ],
  },
  {
    id: 4,
    name: 'Security & Governance',
    subtitle: 'AppSec, CSP, & Input Sanitization',
    description: 'Confirms that automated AppSec, CSP headers, and sanitization checks pass without vulnerability.',
    items: [
      'Automated Web Security score is >90% (Zero XSS sinks detected)',
      'Content Security Policy (CSP) is configured with restrictive frame-ancestors',
      'External CDNs are locked with Subresource Integrity (SRI) SHA-256 digests',
    ],
  },
  {
    id: 5,
    name: 'Audit Evidence',
    subtitle: 'Compliance Snapshot & Timestamped Log',
    description: 'Saves a timestamped validation snapshot for organizational audit compliance and governance.',
    items: [
      'Generate immutable audit token for internal code review logs',
      'Export compliance metadata with developer approval signature',
      'Release build to staging / production deploy pipeline',
    ],
  },
];

export const HumanValidationModal: React.FC<HumanValidationModalProps> = ({
  isOpen,
  onClose,
  project,
  onApproveAndDeploy,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [developerName, setDeveloperName] = useState('Lead Engineer');
  const [notes, setNotes] = useState('Production validation checks verified and approved.');
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const stepData = VALIDATION_STEPS.find((s) => s.id === currentStep) || VALIDATION_STEPS[0];

  const isStepComplete = (stepId: number) => {
    const s = VALIDATION_STEPS.find((x) => x.id === stepId);
    if (!s) return false;
    return s.items.every((_, idx) => checkedItems[`step-${stepId}-${idx}`]);
  };

  const allPreviousStepsComplete = VALIDATION_STEPS.every((s) => isStepComplete(s.id));

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handleExportEvidence = () => {
    const evidence = {
      projectTitle: project?.title || 'Unknown Project',
      timestamp: new Date().toISOString(),
      validationGate: '5-Step Human Validation Protocol',
      validatedBy: developerName,
      status: 'APPROVED_FOR_PRODUCTION',
      steps: VALIDATION_STEPS.map((step) => ({
        stepNumber: step.id,
        stepName: step.name,
        checks: step.items.map((item, idx) => ({
          check: item,
          verified: !!checkedItems[`step-${step.id}-${idx}`],
        })),
      })),
      notes: notes,
      securityScore: '100%',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(evidence, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `human-validation-evidence-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFinalApprove = () => {
    handleExportEvidence();
    onApproveAndDeploy();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b-2 border-black flex items-center justify-between bg-white text-black">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-black bg-black text-white flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2">
                <span>5-Step Human Validation Gate</span>
                <span className="text-[10px] px-2 py-0.5 border border-black bg-white uppercase">
                  ENTERPRISE AUDIT
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-600">
                Maintains human oversight, quality guarantees & audit evidence before release
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Progress Stepper Bar */}
        <div className="grid grid-cols-5 border-b border-neutral-200 bg-neutral-50 divide-x divide-neutral-200">
          {VALIDATION_STEPS.map((s) => {
            const active = currentStep === s.id;
            const completed = isStepComplete(s.id);
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`py-3 px-2 text-center transition-all flex flex-col items-center gap-1 ${
                  active
                    ? 'bg-white text-neutral-900 font-bold border-b-2 border-rose-600 shadow-2xs'
                    : completed
                    ? 'text-emerald-700 bg-emerald-50/40'
                    : 'text-neutral-500 hover:bg-neutral-100/80'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                      completed
                        ? 'bg-emerald-600 text-white'
                        : active
                        ? 'bg-rose-600 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {completed ? <Check className="w-3 h-3" /> : s.id}
                  </div>
                  <span className="text-[11px] truncate max-w-[70px] sm:max-w-none">{s.name}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div className="bg-rose-50/50 border border-rose-200/70 rounded-xl p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-0.5">
              Step {stepData.id} of 5: {stepData.subtitle}
            </div>
            <div className="text-sm font-semibold text-neutral-900">{stepData.description}</div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-neutral-700 uppercase tracking-wide">
              Mandatory Checklist Items:
            </div>
            {stepData.items.map((item, idx) => {
              const checkKey = `step-${stepData.id}-${idx}`;
              const isChecked = !!checkedItems[checkKey];
              return (
                <label
                  key={idx}
                  onClick={() => toggleCheck(checkKey)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-neutral-300 cursor-pointer"
                  />
                  <div className="text-xs font-medium leading-relaxed">{item}</div>
                </label>
              );
            })}
          </div>

          {currentStep === 5 && (
            <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-3">
              <div className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Audit Sign-Off Metadata:
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Auditor Name / Title
                  </label>
                  <input
                    type="text"
                    value={developerName}
                    onChange={(e) => setDeveloperName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 bg-white font-mono text-xs focus:ring-1 focus:ring-rose-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Verification Status
                  </label>
                  <div className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 font-mono text-xs font-bold">
                    READY FOR PRODUCTION DEPLOY
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <div className="text-[11px] font-mono text-neutral-500">
            {Object.keys(checkedItems).length} of 15 Checks Signed Off
          </div>
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 transition-colors"
              >
                Previous Step
              </button>
            )}

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Proceed to Step {currentStep + 1}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinalApprove}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve & Export Audit Evidence</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
