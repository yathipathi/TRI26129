import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const success = resetPasswordWithToken(token, passwordHash);

    if (!success) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.',
    });
  } catch (err) {
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
