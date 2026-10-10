'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';
import { 
  FolderGit2, CheckCircle2, AlertTriangle, Download, ArrowRight, 
  Sparkles, ShieldCheck, Activity, Search, RefreshCw, Plus, 
  Trash2, Copy, Edit3, Grid, List, LogOut, Settings, Clock, 
  ExternalLink, ChevronDown, User as UserIcon, Layout, Filter, Zap,
  Inbox, Palette, Moon, Sun, MoreVertical, FileText, Check, Layers
} from 'lucide-react';
import {
  Button, Card, CardHeader, CardContent, CardFooter,
  Badge, Chip, Input, Dialog, DialogContent, DialogHeader, DialogTitle,
  Avatar, AvatarFallback, LinearProgress
} from '@/components/ui';

interface ProjectItem {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'verified' | 'exported';
  currentVersion: number;
  createdAt: number;
  updatedAt: number;
}

interface Insights {
  totalProjects: number;
  verifiedCount: number;
  exportedCount: number;
  draftCount: number;
  totalVersions: number;
  formSubmissionsCount: number;
  unverifiedClaimsCount: number;
  verificationPassRate: number;
  unintendedSectionChanges: number;
}

interface ActivityItem {
  id: string;
  type: string;
  projectId?: string;
  metadata?: any;
  createdAt: number;
}

export default function HomePage() {
  const router = useRouter();
  const { themeMode, skin, resolvedTheme, setThemeMode, setSkin, toggleTheme } = useTheme();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [insights, setInsights] = useState<Insights>({
    totalProjects: 0,
    verifiedCount: 0,
    exportedCount: 0,
    draftCount: 0,
    totalVersions: 0,
    formSubmissionsCount: 0,
    unverifiedClaimsCount: 0,
    verificationPassRate: 100,
    unintendedSectionChanges: 0,
  });
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [userProfile, setUserProfile] = useState<{ id: string; email: string; name: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'name' | 'versions'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Menu
  const [renameTarget, setRenameTarget] = useState<ProjectItem | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('projects');

  // Quick Start Prompt Box
  const [quickPrompt, setQuickPrompt] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/projects');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
        if (data.insights) setInsights(data.insights);
        if (data.activityFeed) setActivityFeed(data.activityFeed);
        if (data.userProfile) setUserProfile(data.userProfile);
      } else {
        setError(data.error || 'Failed to load dashboard data');
      }
    } catch {
      setError('Connection error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      const res = await fetch(`/api/projects/${renameTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (res.ok) {
        setProjects((prev) =>
          prev.map((p) => (p.id === renameTarget.id ? { ...p, name: renameValue.trim() } : p))
        );
        setRenameTarget(null);
      } else {
        alert('Rename failed');
      }
    } catch {
      alert('Error updating project name');
    }
  };

  const handleDuplicate = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.project) {
        setProjects((prev) => [data.project, ...prev]);
        setInsights((prev) => ({
          ...prev,
          totalProjects: prev.totalProjects + 1,
          draftCount: prev.draftCount + 1,
        }));
      } else {
        alert('Duplicate failed');
      }
    } catch {
      alert('Error duplicating project');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        alert('Delete failed');
      }
    } catch {
      alert('Error deleting project');
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    router.push(`/builder?prompt=${encodeURIComponent(quickPrompt.trim())}`);
  };

  // Filter & Sort Logic
  const filteredProjects = projects
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return b.updatedAt - a.updatedAt;
      if (sortBy === 'oldest') return a.updatedAt - b.updatedAt;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'versions') return b.currentVersion - a.currentVersion;
      return 0;
    });

  return (
    <div className="min-h-screen bg-md-surface-low text-md-on-surface flex flex-col font-sans selection:bg-md-primary-container selection:text-md-on-primary-container">
      {/* ─── Top Google Workspace App Bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-md-surface/90 backdrop-blur-md border-b border-md-outline-variant/50 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-md-primary" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight block text-md-on-surface leading-tight">SiteForge</span>
            <span className="text-[11px] text-md-on-surface-variant">Workspace Studio</span>
          </div>
        </div>

        {/* M3 Continuous Search Bar Pill */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-md-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search websites, specs, niche components..."
              className="w-full pl-10 pr-4 py-2 rounded-md-full bg-md-surface-container-high border border-transparent hover:border-md-outline-variant/60 focus:border-md-primary text-sm outline-none m3-transition text-md-on-surface placeholder:text-md-on-surface-variant/60"
            />
          </div>
        </div>

        {/* Toolbar Right Controls */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme Mode">
            {resolvedTheme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>

          <Link href="/design-system">
            <Button variant="ghost" size="icon" title="View Design System Showcase">
              <Palette className="w-4 h-4" />
            </Button>
          </Link>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-md-full hover:bg-md-surface-container m3-transition cursor-pointer"
            >
              <Avatar>
                <AvatarFallback>{userProfile?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3.5 h-3.5 text-md-on-surface-variant" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-md-surface rounded-md-xl border border-md-outline-variant shadow-md-3 p-2 z-50 animate-fadeIn">
                <div className="p-3 border-b border-md-outline-variant/40">
                  <p className="text-sm font-bold text-md-on-surface">{userProfile?.name || 'User'}</p>
                  <p className="text-xs text-md-on-surface-variant truncate">{userProfile?.email}</p>
                </div>

                <div className="py-1 space-y-0.5">
                  <div className="px-3 py-2 text-xs font-semibold text-md-on-surface-variant">Active Skin</div>
                  <button
                    onClick={() => setSkin('material3')}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md-sm flex items-center justify-between ${
                      skin === 'material3' ? 'bg-md-primary-container text-md-on-primary-container font-semibold' : 'hover:bg-md-surface-container'
                    }`}
                  >
                    <span>Google Material 3</span>
                    {skin === 'material3' && <Check className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setSkin('fluent2')}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md-sm flex items-center justify-between ${
                      skin === 'fluent2' ? 'bg-md-primary-container text-md-on-primary-container font-semibold' : 'hover:bg-md-surface-container'
                    }`}
                  >
                    <span>Microsoft Fluent 2</span>
                    {skin === 'fluent2' && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="border-t border-md-outline-variant/40 pt-1 mt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs text-md-error hover:bg-md-error-container/40 rounded-md-sm flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Main Body Shell Layout ────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Rail / Drawer */}
        <aside className="w-64 bg-md-surface border-r border-md-outline-variant/40 p-4 hidden md:flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Primary Action FAB */}
            <Link href="/builder" className="block">
              <Button variant="fab" className="w-full py-3.5 text-sm font-semibold justify-start px-5 gap-3">
                <Plus className="w-5 h-5 text-md-primary" />
                <span>Create Site with AI</span>
              </Button>
            </Link>

            {/* Navigation Drawer Items */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveNav('projects')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md-full text-sm font-medium m3-transition cursor-pointer ${
                  activeNav === 'projects'
                    ? 'bg-md-secondary-container text-md-on-secondary-container font-semibold'
                    : 'text-md-on-surface-variant hover:bg-md-surface-container'
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>All Projects</span>
              </button>

              <Link href="/templates" className="block">
                <div className="flex items-center gap-3 px-4 py-3 rounded-md-full text-sm font-medium text-md-on-surface-variant hover:bg-md-surface-container m3-transition">
                  <Layout className="w-4 h-4" />
                  <span>Templates Library</span>
                </div>
              </Link>

              <Link href="/design-system" className="block">
                <div className="flex items-center gap-3 px-4 py-3 rounded-md-full text-sm font-medium text-md-on-surface-variant hover:bg-md-surface-container m3-transition">
                  <Palette className="w-4 h-4" />
                  <span>Design Tokens</span>
                </div>
              </Link>
            </nav>
          </div>

          {/* Bottom Security / Status Footer */}
          <div className="p-3 bg-md-surface-container rounded-md-lg border border-md-outline-variant/40 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-md-primary">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifier Active</span>
            </div>
            <p className="text-[11px] text-md-on-surface-variant">
              Every exported ZIP is automatically Playwright crawl-tested with proof report.
            </p>
          </div>
        </aside>

        {/* Right Main Dashboard Workspace Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {/* Quick AI Generation Bar */}
          <Card className="bg-gradient-to-r from-md-primary-container/40 via-md-surface to-md-secondary-container/30 p-6 md:p-8 rounded-md-xl border border-md-primary/20">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-md-primary">
                <Zap className="w-4 h-4" />
                <span>Instant Website Generator</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-md-on-surface">
                Describe the website you want to build
              </h1>
              <p className="text-xs md:text-sm text-md-on-surface-variant">
                Our AI researches competitors, sources real facts with URLs, and structures sections cleanly.
              </p>

              <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                <Input
                  type="text"
                  value={quickPrompt}
                  onChange={(e) => setQuickPrompt(e.target.value)}
                  placeholder="e.g. Hyderabad Craft Bakery with Telugu menu, UPI payment & online orders..."
                  className="flex-1 py-3 text-sm bg-md-surface rounded-md-full shadow-xs"
                />
                <Button type="submit" variant="filled" className="px-6 py-3 font-semibold shadow-md-1">
                  <span>Generate Site</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* Key Metric Insight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-md-on-surface-variant">Total Web Projects</p>
                  <p className="text-2xl font-bold text-md-on-surface mt-1">{insights.totalProjects}</p>
                </div>
                <div className="p-3 bg-md-primary-container text-md-on-primary-container rounded-md-full">
                  <FolderGit2 className="w-5 h-5 text-md-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-md-on-surface-variant">Playwright Verification Pass</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{insights.verificationPassRate}%</p>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-md-full">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-md-on-surface-variant">Total Site Versions</p>
                  <p className="text-2xl font-bold text-md-on-surface mt-1">{insights.totalVersions}</p>
                </div>
                <div className="p-3 bg-md-secondary-container text-md-on-secondary-container rounded-md-full">
                  <Layers className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-md-on-surface-variant">Exported Standalone ZIPs</p>
                  <p className="text-2xl font-bold text-md-on-surface mt-1">{insights.exportedCount}</p>
                </div>
                <div className="p-3 bg-md-tertiary-container text-md-on-tertiary-container rounded-md-full">
                  <Download className="w-5 h-5 text-md-tertiary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Chips Toolbar & Layout Toggles */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-md-outline-variant/40 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-md-on-surface-variant mr-1">Status:</span>
              {['all', 'verified', 'draft', 'exported'].map((st) => (
                <Chip
                  key={st}
                  active={statusFilter === st}
                  onClick={() => setStatusFilter(st)}
                >
                  {st === 'all' ? 'All Sites' : st.charAt(0).toUpperCase() + st.slice(1)}
                </Chip>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs bg-md-surface border border-md-outline-variant rounded-md-sm px-3 py-1.5 text-md-on-surface"
              >
                <option value="recent">Sort by: Recently Modified</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="name">Sort by: Project Name</option>
                <option value="versions">Sort by: Highest Version</option>
              </select>

              <div className="flex items-center bg-md-surface p-1 rounded-md-sm border border-md-outline-variant">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md-xs text-xs ${viewMode === 'grid' ? 'bg-md-primary-container text-md-on-primary-container' : 'text-md-on-surface-variant'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md-xs text-xs ${viewMode === 'list' ? 'bg-md-primary-container text-md-on-primary-container' : 'text-md-on-surface-variant'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Loading / Error States */}
          {loading && (
            <div className="py-12 space-y-3 text-center">
              <LinearProgress className="max-w-md mx-auto" />
              <p className="text-xs text-md-on-surface-variant">Loading workspace project history...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-md-md bg-md-error-container text-md-on-error-container text-xs flex items-center justify-between">
              <span>{error}</span>
              <Button size="sm" variant="ghost" onClick={fetchDashboardData}>Retry</Button>
            </div>
          )}

          {/* Project Items Grid / List */}
          {!loading && filteredProjects.length === 0 && (
            <Card className="p-12 text-center space-y-4 border-dashed">
              <div className="w-12 h-12 rounded-md-full bg-md-surface-container mx-auto flex items-center justify-center text-md-on-surface-variant">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-md-on-surface">No projects match your filter</h3>
                <p className="text-xs text-md-on-surface-variant mt-1">Start a new project or adjust your search keywords.</p>
              </div>
              <Link href="/builder">
                <Button variant="filled" size="sm" className="mt-2">Create First Website</Button>
              </Link>
            </Card>
          )}

          {!loading && filteredProjects.length > 0 && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md-2 m3-transition group flex flex-col justify-between">
                  <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-md-on-surface group-hover:text-md-primary m3-transition">
                          {project.name}
                        </h3>
                        <Badge variant={project.status === 'verified' ? 'primary' : 'tonal'}>
                          v{project.currentVersion}
                        </Badge>
                      </div>
                      <p className="text-xs text-md-on-surface-variant mt-1">{project.type}</p>
                    </div>

                    <Badge variant={project.status === 'verified' ? 'primary' : 'outline'}>
                      {project.status.toUpperCase()}
                    </Badge>
                  </CardHeader>

                  <CardContent className="py-2 text-xs text-md-on-surface-variant space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-md-outline" />
                      <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 border-t border-md-outline-variant/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/projects/${project.id}/edit`}>
                        <Button variant="filled" size="sm" className="text-xs py-1.5 px-3">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Visual Editor</span>
                        </Button>
                      </Link>
                      <Link href={`/preview/${project.id}`} target="_blank">
                        <Button variant="ghost" size="icon" title="Live Preview">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(project.id)}
                        title="Duplicate Site"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setRenameTarget(project);
                          setRenameValue(project.name);
                        }}
                        title="Rename Project"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(project)}
                        title="Delete Project"
                        className="text-md-error hover:bg-md-error-container/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renameTarget} onClose={() => setRenameTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new project title..."
            />
          </div>
          <CardFooter className="justify-end gap-3">
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button variant="filled" onClick={handleRenameSubmit}>Save Name</Button>
          </CardFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-md-error">Confirm Delete Project</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-sm text-md-on-surface space-y-2">
            <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</p>
            <p className="text-xs text-md-on-surface-variant">This action will remove the site spec, version history, and offline preview files.</p>
          </div>
          <CardFooter className="justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="filled" className="bg-md-error text-md-on-error" onClick={handleDeleteSubmit}>Delete Project</Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
