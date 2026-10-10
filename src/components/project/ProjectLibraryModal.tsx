'use client';

import React from 'react';
import { WebsiteProject } from '@/types';
import { 
  X, FolderKanban, Plus, Clock, Layers, ArrowRight, 
  Trash2, Copy, Check, ExternalLink 
} from 'lucide-react';

interface ProjectLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: WebsiteProject | null;
  savedProjects: WebsiteProject[];
  onSelectProject: (project: WebsiteProject) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
}

export const ProjectLibraryModal: React.FC<ProjectLibraryModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  savedProjects,
  onSelectProject,
  onDeleteProject,
  onOpenNewProjectModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border-2 border-black overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b-2 border-black bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-black tracking-tight uppercase">
                Project Library & History
              </h2>
              <p className="text-xs text-neutral-600">
                Switch between your generated websites or create a new one.
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

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3">
          {savedProjects.length === 0 ? (
            <div className="text-center py-12 text-black">
              <FolderKanban className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
              <p className="text-sm font-medium">No saved projects found.</p>
            </div>
          ) : (
            savedProjects.map((p) => {
              const isCurrent = currentProject?.id === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-4 ${
                    isCurrent
                      ? 'border-black bg-neutral-100 shadow-xs'
                      : 'border-neutral-300 hover:border-black bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div 
                    onClick={() => {
                      onSelectProject(p);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-black">
                        {p.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-white bg-black px-2 py-0.5 rounded-full uppercase">
                          Active
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-neutral-600">
                        {p.sections?.length || 0} sections
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-1">
                      {p.prompt || p.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onSelectProject(p);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-black hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
                    >
                      Open
                    </button>
                    {savedProjects.length > 1 && !isCurrent && (
                      <button
                        onClick={() => onDeleteProject(p.id)}
                        title="Delete Project"
                        className="p-1.5 text-black hover:bg-neutral-200 rounded-lg transition-colors border border-black"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t-2 border-black bg-neutral-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-black font-mono font-bold">
            {savedProjects.length} TOTAL PROJECTS
          </span>

          <button
            onClick={() => {
              onClose();
              onOpenNewProjectModal();
            }}
            className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};
