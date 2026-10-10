import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Project, Version, SourceCitation, VerificationReport, SecurityReport, FormSubmission, EventLog, SiteSpec } from '@/types';

const DB_FILE = path.join(process.cwd(), 'data', 'siteforge_db.json');

interface DatabaseSchema {
  users: User[];
  projects: Project[];
  versions: Version[];
  sources: (SourceCitation & { projectId: string })[];
  verificationReports: VerificationReport[];
  securityReports: SecurityReport[];
  submissions: FormSubmission[];
  events: EventLog[];
}

function ensureDbFile(): DatabaseSchema {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(DB_FILE)) {
    const defaultData: DatabaseSchema = {
      users: [
        { id: 'usr-default', email: 'demo@siteforge.ai', name: 'Lead Architect', createdAt: Date.now() },
      ],
      projects: [],
      versions: [],
      sources: [],
      verificationReports: [],
      securityReports: [],
      submissions: [],
      events: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch {
    const emptyData: DatabaseSchema = {
      users: [{ id: 'usr-default', email: 'demo@siteforge.ai', name: 'Lead Architect', createdAt: Date.now() }],
      projects: [],
      versions: [],
      sources: [],
      verificationReports: [],
      securityReports: [],
      submissions: [],
      events: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(emptyData, null, 2), 'utf-8');
    return emptyData;
  }
}

function saveDb(db: DatabaseSchema) {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// -----------------------------------------------------------------------------------------
// AUTH & USER FUNCTIONS
// -----------------------------------------------------------------------------------------

export function registerUser(email: string, name: string, passwordHash?: string): User {
  const db = ensureDbFile();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    if (passwordHash && !existing.passwordHash) {
      existing.passwordHash = passwordHash;
      saveDb(db);
    }
    return existing;
  }

  const newUser: User = {
    id: 'usr-' + crypto.randomUUID().substring(0, 8),
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: Date.now(),
  };
  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

export function getUserByEmail(email: string): User | null {
  const db = ensureDbFile();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function getUserById(userId: string): User | null {
  const db = ensureDbFile();
  return db.users.find((u) => u.id === userId) || null;
}

export function setUserResetToken(email: string, token: string, exp: number): boolean {
  const db = ensureDbFile();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;

  user.resetToken = token;
  user.resetTokenExp = exp;
  saveDb(db);
  return true;
}

export function resetPasswordWithToken(token: string, newPasswordHash: string): boolean {
  const db = ensureDbFile();
  const user = db.users.find((u) => u.resetToken === token && u.resetTokenExp && Date.now() < u.resetTokenExp);
  if (!user) return false;

  user.passwordHash = newPasswordHash;
  delete user.resetToken;
  delete user.resetTokenExp;
  saveDb(db);
  return true;
}

// -----------------------------------------------------------------------------------------
// PROJECT & VERSION FUNCTIONS (Row Level Security / User Isolated)
// -----------------------------------------------------------------------------------------

export function getProjectsForUser(userId: string): Project[] {
  const db = ensureDbFile();
  return db.projects.filter((p) => p.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProjectById(projectId: string, userId?: string): Project | null {
  const db = ensureDbFile();
  const p = db.projects.find((proj) => proj.id === projectId);
  if (!p) return null;
  if (userId && p.userId !== userId) return null; // Strict Row-Level Security
  return p;
}

export function createProject(userId: string, name: string, type: string, initialSpec: SiteSpec): { project: Project; version: Version } {
  const db = ensureDbFile();
  const projectId = initialSpec.meta.siteId || 'proj-' + crypto.randomUUID().substring(0, 8);
  const now = Date.now();

  const project: Project = {
    id: projectId,
    userId,
    name,
    type,
    status: 'draft',
    currentVersion: 1,
    createdAt: now,
    updatedAt: now,
  };

  const version: Version = {
    id: `ver-${projectId}-v1`,
    projectId,
    versionNumber: 1,
    spec: initialSpec,
    label: 'Initial AI Generation',
    createdBy: userId,
    createdAt: now,
  };

  db.projects.push(project);
  db.versions.push(version);

  db.events.push({
    id: 'evt-' + crypto.randomUUID().substring(0, 8),
    userId,
    projectId,
    type: 'PROJECT_CREATED',
    metadata: { name, type },
    createdAt: now,
  });

  saveDb(db);
  return { project, version };
}

export function renameProject(projectId: string, userId: string, newName: string): Project | null {
  const db = ensureDbFile();
  const project = db.projects.find((p) => p.id === projectId && p.userId === userId);
  if (!project) return null;

  project.name = newName;
  project.updatedAt = Date.now();
  saveDb(db);
  return project;
}

export function duplicateProject(projectId: string, userId: string): Project | null {
  const db = ensureDbFile();
  const original = db.projects.find((p) => p.id === projectId && p.userId === userId);
  if (!original) return null;

  const newId = 'proj-' + crypto.randomUUID().substring(0, 8);
  const now = Date.now();

  const duplicatedProject: Project = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    currentVersion: 1,
    createdAt: now,
    updatedAt: now,
  };

  // Copy latest version spec
  const origVersions = db.versions.filter((v) => v.projectId === projectId).sort((a, b) => b.versionNumber - a.versionNumber);
  const latestSpec = origVersions[0]?.spec || { meta: { siteId: newId, siteName: duplicatedProject.name, siteType: duplicatedProject.type } };

  const duplicatedVersion: Version = {
    id: `ver-${newId}-v1`,
    projectId: newId,
    versionNumber: 1,
    spec: JSON.parse(JSON.stringify(latestSpec)),
    label: `Duplicated from ${original.name}`,
    createdBy: userId,
    createdAt: now,
  };

  db.projects.push(duplicatedProject);
  db.versions.push(duplicatedVersion);

  db.events.push({
    id: 'evt-' + crypto.randomUUID().substring(0, 8),
    userId,
    projectId: newId,
    type: 'PROJECT_DUPLICATED',
    metadata: { originalId: projectId, newName: duplicatedProject.name },
    createdAt: now,
  });

  saveDb(db);
  return duplicatedProject;
}

export function deleteProject(projectId: string, userId: string): boolean {
  const db = ensureDbFile();
  const idx = db.projects.findIndex((p) => p.id === projectId && p.userId === userId);
  if (idx === -1) return false;

  db.projects.splice(idx, 1);
  db.versions = db.versions.filter((v) => v.projectId !== projectId);
  db.submissions = db.submissions.filter((s) => s.projectId !== projectId);

  db.events.push({
    id: 'evt-' + crypto.randomUUID().substring(0, 8),
    userId,
    projectId,
    type: 'PROJECT_DELETED',
    metadata: {},
    createdAt: Date.now(),
  });

  saveDb(db);
  return true;
}

export function createNewVersion(projectId: string, userId: string, spec: SiteSpec, label: string): Version {
  const db = ensureDbFile();
  const p = db.projects.find((proj) => proj.id === projectId);
  const nextVerNum = p ? p.currentVersion + 1 : 1;
  const now = Date.now();

  const version: Version = {
    id: `ver-${projectId}-v${nextVerNum}`,
    projectId,
    versionNumber: nextVerNum,
    spec,
    label,
    createdBy: userId,
    createdAt: now,
  };

  db.versions.push(version);

  if (p) {
    p.currentVersion = nextVerNum;
    p.updatedAt = now;
  }

  db.events.push({
    id: 'evt-' + crypto.randomUUID().substring(0, 8),
    userId,
    projectId,
    type: 'VERSION_CREATED',
    metadata: { versionNumber: nextVerNum, label },
    createdAt: now,
  });

  saveDb(db);
  return version;
}

export function getVersionsForProject(projectId: string, userId?: string): Version[] {
  const db = ensureDbFile();
  if (userId) {
    const proj = db.projects.find((p) => p.id === projectId && p.userId === userId);
    if (!proj) return [];
  }
  return db.versions.filter((v) => v.projectId === projectId).sort((a, b) => b.versionNumber - a.versionNumber);
}

export function getVersionByNumber(projectId: string, versionNumber: number): Version | null {
  const db = ensureDbFile();
  return db.versions.find((v) => v.projectId === projectId && v.versionNumber === versionNumber) || null;
}

export function updateProjectStatus(projectId: string, status: 'draft' | 'verified' | 'exported') {
  const db = ensureDbFile();
  const p = db.projects.find((proj) => proj.id === projectId);
  if (p) {
    p.status = status;
    p.updatedAt = Date.now();
    saveDb(db);
  }
}

// -----------------------------------------------------------------------------------------
// VERIFICATION & SECURITY REPORTS
// -----------------------------------------------------------------------------------------

export function saveVerificationReport(report: VerificationReport) {
  const db = ensureDbFile();
  const idx = db.verificationReports.findIndex((r) => r.versionId === report.versionId);
  if (idx !== -1) {
    db.verificationReports[idx] = report;
  } else {
    db.verificationReports.push(report);
  }

  const ver = db.versions.find((v) => v.id === report.versionId);
  if (ver && report.status === 'PASS') {
    const proj = db.projects.find((p) => p.id === ver.projectId);
    if (proj && proj.status === 'draft') {
      proj.status = 'verified';
    }
  }

  saveDb(db);
}

export function getVerificationReport(versionId: string): VerificationReport | null {
  const db = ensureDbFile();
  return db.verificationReports.find((r) => r.versionId === versionId) || null;
}

export function saveSecurityReport(report: SecurityReport) {
  const db = ensureDbFile();
  const idx = db.securityReports.findIndex((r) => r.versionId === report.versionId);
  if (idx !== -1) {
    db.securityReports[idx] = report;
  } else {
    db.securityReports.push(report);
  }
  saveDb(db);
}

export function getSecurityReport(versionId: string): SecurityReport | null {
  const db = ensureDbFile();
  return db.securityReports.find((r) => r.versionId === versionId) || null;
}

// -----------------------------------------------------------------------------------------
// FORM SUBMISSIONS & INSIGHT METRICS
// -----------------------------------------------------------------------------------------

export function recordFormSubmission(projectId: string, formName: string, data: Record<string, any>): FormSubmission {
  const db = ensureDbFile();
  const submission: FormSubmission = {
    id: 'sub-' + crypto.randomUUID().substring(0, 8),
    projectId,
    formName,
    data,
    createdAt: Date.now(),
  };
  db.submissions.push(submission);
  saveDb(db);
  return submission;
}

export function getSubmissionsForProject(projectId: string): FormSubmission[] {
  const db = ensureDbFile();
  return db.submissions.filter((s) => s.projectId === projectId).sort((a, b) => b.createdAt - a.createdAt);
}

export function logInsightEvent(userId: string, type: string, projectId?: string, metadata?: Record<string, any>) {
  const db = ensureDbFile();
  db.events.push({
    id: 'evt-' + crypto.randomUUID().substring(0, 8),
    userId,
    projectId,
    type,
    metadata,
    createdAt: Date.now(),
  });
  saveDb(db);
}

export function getUserActivityFeed(userId: string): EventLog[] {
  const db = ensureDbFile();
  return db.events.filter((e) => e.userId === userId).sort((a, b) => b.createdAt - a.createdAt).slice(0, 15);
}

export function getInsightsMetrics(userId: string) {
  const db = ensureDbFile();
  const userProjects = getProjectsForUser(userId);
  const totalProjects = userProjects.length;
  const verifiedCount = userProjects.filter((p) => p.status === 'verified').length;
  const exportedCount = userProjects.filter((p) => p.status === 'exported').length;
  const draftCount = userProjects.filter((p) => p.status === 'draft').length;

  const projectIds = new Set(userProjects.map((p) => p.id));
  const userVersions = db.versions.filter((v) => projectIds.has(v.projectId));
  const totalVersions = userVersions.length;

  const userSubmissions = db.submissions.filter((s) => projectIds.has(s.projectId));
  const formSubmissionsCount = userSubmissions.length;

  const totalEvents = db.events.filter((e) => e.userId === userId);
  const unverifiedResolvedCount = totalEvents.filter((e) => e.type === 'FLAG_RESOLVED').length;
  const sectionEditCount = totalEvents.filter((e) => e.type === 'SECTION_EDITED').length;

  return {
    totalProjects,
    verifiedCount,
    exportedCount,
    draftCount,
    totalVersions,
    formSubmissionsCount,
    unverifiedClaimsCount: 0,
    unverifiedResolvedCount,
    sectionEditCount,
    verificationPassRate: totalProjects > 0 ? Math.round((verifiedCount / totalProjects) * 100) : 100,
    unintendedSectionChanges: 0,
  };
}
