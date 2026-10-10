import { NextRequest, NextResponse } from 'next/server';
import { getProjectsForUser, getInsightsMetrics } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = req.cookies.get('siteforge_user')?.value || 'usr-default';
    const projects = getProjectsForUser(userId);
    const insights = getInsightsMetrics(userId);

    return NextResponse.json({ projects, insights });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch projects' }, { status: 500 });
  }
}
