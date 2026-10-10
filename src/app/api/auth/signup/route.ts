import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, registerUser } from '@/lib/db';
import { hashPassword, signJwt, checkRateLimit } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`signup:${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Too many signup attempts. Please try again shortly.' }, { status: 429 });
    }

    const { name, email, password, confirmPassword, terms } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (!terms) {
      return NextResponse.json({ error: 'You must accept the terms to create an account' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const existing = getUserByEmail(email);
    if (existing && existing.passwordHash) {
      return NextResponse.json({ error: 'An account with this email address already exists. Please sign in.' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const user = registerUser(email, name, passwordHash);

    const token = signJwt({ userId: user.id, email: user.email, name: user.name });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to SiteForge.',
      user: { id: user.id, email: user.email, name: user.name },
      redirectUrl: '/',
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

    response.cookies.set({
      name: 'siteforge_user',
      value: user.id,
      httpOnly: true,
      path: '/',
      maxAge: 7 * 86400,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: 'Signup processing failed' }, { status: 500 });
  }
}
