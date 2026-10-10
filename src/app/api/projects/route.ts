import { NextRequest, NextResponse } from 'next/server';
import { getProjectsForUser, getInsightsMetrics, getUserActivityFeed, getUserById } from '@/lib/db';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('siteforge_session')?.value;
    const payload = verifyJwt(token || '');
    const userId = payload?.userId || req.cookies.get('siteforge_user')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projects = getProjectsForUser(userId);
    const insights = getInsightsMetrics(userId);
    const activityFeed = getUserActivityFeed(userId);
    const user = getUserById(userId);

    return NextResponse.json({
      projects,
      insights,
      activityFeed,
      userProfile: user ? { id: user.id, email: user.email, name: user.name } : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
