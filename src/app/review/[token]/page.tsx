'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MessageSquare, CheckCircle, Lock, ShieldCheck, Send, Loader2 } from 'lucide-react';
import { DynamicSectionRenderer } from '@/components/sections/DynamicSectionRenderer';

export default function TokenizedReviewPage() {
  const params = useParams();
  const token = (params?.token as string) || '';

  const [project, setProject] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchReviewData();
  }, [token]);

  const fetchReviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/review?token=${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid or expired review link');
      setProject(data.project);
      setComments(data.comments || []);
    } catch (err: any) {
      setError(err.message || 'Access denied');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await fetch('/api/review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          sectionId: targetSectionId || 'general',
          author: authorName.trim() || 'Guest Reviewer',
          text: commentText.trim(),
        }),
      });

      if (res.ok) {
        setCommentText('');
        fetchReviewData();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm">Loading shareable review preview...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-surface border border-error/20 rounded-2xl p-8 max-w-md text-center space-y-4">
          <Lock className="w-10 h-10 text-error mx-auto opacity-70" />
          <h2 className="text-lg font-bold text-foreground">Access Restricted or Expired</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{error || 'This review link is no longer active.'}</p>
        </div>
      </div>
    );
  }

  const sections = project.siteSpec?.sections || project.siteSpec?.pages?.[0]?.sections || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Banner */}
      <header className="bg-surface border-b border-outline/10 px-6 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-foreground">{project.name} (Reviewer Mode)</h1>
            <p className="text-[11px] text-muted-foreground">Read-only preview link. Leave section-pinned feedback below.</p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 bg-surface-variant text-muted-foreground font-mono rounded-full">
          Read-Only Mode
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Rendered Site */}
        <main className="flex-1 overflow-y-auto">
          {sections.map((section: any, idx: number) => (
            <div key={section.id} className="relative group border-b border-outline/5">
              <DynamicSectionRenderer
                section={section}
                index={idx}
                totalSections={sections.length}
                isEditable={false}
              />
              <button
                onClick={() => setTargetSectionId(section.id)}
                className="absolute top-4 right-4 px-3 py-1.5 bg-primary/90 text-on-primary text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition shadow-md flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Comment on Section
              </button>
            </div>
          ))}
        </main>

        {/* Review Comments Sidebar */}
        <aside className="w-full md:w-80 bg-surface border-l border-outline/10 p-6 flex flex-col justify-between">
          <div className="space-y-4 flex-1 overflow-y-auto">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Review Comments ({comments.length})
            </h3>

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="p-3 bg-surface-variant/30 border border-outline/10 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">{c.author}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">#{c.sectionId}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handlePostComment} className="pt-4 border-t border-outline/10 space-y-3">
            <input
              type="text"
              placeholder="Your Name (e.g. Sarah)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
            />
            <textarea
              rows={3}
              placeholder={targetSectionId ? `Comment on section ${targetSectionId}...` : 'General site comment...'}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3 py-2 bg-surface-variant/30 border border-outline/20 rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              required
            />
            <button
              type="submit"
              className="w-full py-2 bg-primary text-on-primary font-semibold rounded-xl text-xs hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Post Feedback
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
