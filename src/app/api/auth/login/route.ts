import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/db';
import { verifyPassword, signJwt, checkRateLimit, validateNextPath } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`login:${ip}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again in 1 minute.' }, { status: 429 });
    }

    const { email, password, next } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const user = getUserByEmail(email);

    // Generic error message for both non-existent user and wrong password to prevent email enumeration
    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ 
        error: 'Invalid email or password', 
        showSignupHint: !user // Help UX without breaking security
      }, { status: 401 });
    }

    const token = signJwt({ userId: user.id, email: user.email, name: user.name });
    const redirectUrl = validateNextPath(next);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      redirectUrl,
    });

    response.cookies.set({
      name: 'siteforge_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 86400,
    });

    // Also set legacy siteforge_user cookie for backward compatibility
    response.cookies.set({
      name: 'siteforge_user',
      value: user.id,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 86400,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
