import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '@/lib/auth';
import { getUserById } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');

  if (!payload || !payload.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = getUserById(payload.userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
  });
}
