import { NextRequest, NextResponse } from 'next/server';
import { 
  getProjectById, getVersionsForProject, getSubmissionsForProject, 
  getVerificationReport, getSecurityReport 
} from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = req.cookies.get('siteforge_user')?.value || 'usr-default';

    const project = getProjectById(id, userId);
    const versions = getVersionsForProject(id);
    const submissions = getSubmissionsForProject(id);

    const latestVersion = versions[0];
    const verificationReport = latestVersion ? getVerificationReport(latestVersion.id) : null;
    const securityReport = latestVersion ? getSecurityReport(latestVersion.id) : null;

    return NextResponse.json({
      project,
      versions,
      submissions,
      verificationReport,
      securityReport,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch project details' }, { status: 500 });
  }
}
