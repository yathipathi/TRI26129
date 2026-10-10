'use client';

import React from 'react';
import { AIProposal } from '@/types';
import { Sparkles, CheckCircle2, XCircle, AlertTriangle, Pin } from 'lucide-react';

interface AIProposalModalProps {
  proposal: AIProposal;
  onAccept: (proposal: AIProposal) => void;
  onReject: () => void;
}

export default function AIProposalModal({ proposal, onAccept, onReject }: AIProposalModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono text-xs">
      <div className="bg-white border-2 border-black max-w-2xl w-full p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center gap-2 font-black uppercase text-base">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span>AI Edit Proposal Review</span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 border border-black bg-neutral-100">
            Scope: {proposal.scope.toUpperCase()}
          </span>
        </div>

        {/* User Prompt & Explanation */}
        <div className="p-3 border border-black bg-neutral-50 space-y-1">
          <div className="font-bold text-black uppercase text-[11px]">Prompt: "{proposal.prompt}"</div>
          <p className="text-neutral-600 text-[11px]">{proposal.explanation}</p>
        </div>

        {/* Skipped Pinned Fields Notice */}
        {proposal.skippedPinnedFields && proposal.skippedPinnedFields.length > 0 && (
          <div className="p-3 border border-amber-600 bg-amber-50 text-amber-900 flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Notice:</span> Pinned fields [{proposal.skippedPinnedFields.join(', ')}] were skipped to protect your manual edits.
            </div>
          </div>
        )}

        {/* Before / After Diff Table */}
        <div className="space-y-3">
          <div className="font-bold uppercase text-xs">Proposed Changes Diff</div>

          <div className="space-y-3">
            {(proposal?.diffs || proposal?.diffSummary || []).map((diff: any, idx: number) => (
              <div key={idx} className="border-2 border-black p-3 bg-white space-y-2">
                <div className="font-bold uppercase text-black border-b border-black pb-1">
                  Field / Section: {diff.field || diff.sectionTitle || diff.sectionId || `Item #${idx + 1}`}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-2 border border-red-300 bg-red-50 text-red-900 space-y-1 overflow-x-auto">
                    <div className="font-bold uppercase text-[9px] text-red-700">Before</div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(diff.before ?? diff.beforeProps ?? '', null, 2)}</pre>
                  </div>

                  <div className="p-2 border border-emerald-300 bg-emerald-50 text-emerald-900 space-y-1 overflow-x-auto">
                    <div className="font-bold uppercase text-[9px] text-emerald-700">After (Proposed)</div>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(diff.after ?? diff.afterProps ?? '', null, 2)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-3 border-t-2 border-black pt-4">
          <button
            onClick={onReject}
            className="px-4 py-2.5 border-2 border-black bg-white hover:bg-neutral-100 font-bold uppercase flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Reject Changes</span>
          </button>

          <button
            onClick={() => onAccept(proposal)}
            className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 font-bold uppercase flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Accept Proposal & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
