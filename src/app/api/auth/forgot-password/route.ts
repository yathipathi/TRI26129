import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, setUserResetToken } from '@/lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Standard generic response for both registered and unregistered emails (prevents enumeration)
    const genericResponse = NextResponse.json({
      success: true,
      message: 'If an account exists for this email, password reset instructions have been dispatched.',
    });

    if (!email) return genericResponse;

    const user = getUserByEmail(email);
    if (!user) return genericResponse;

    const token = crypto.randomBytes(32).toString('hex');
    const exp = Date.now() + 3600000; // 1 hour

    setUserResetToken(email, token, exp);

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    console.log('\n======================================================');
    console.log(`[LOCAL AUTH] PASSWORD RESET LINK FOR ${email}:`);
    console.log(resetUrl);
    console.log('======================================================\n');

    return genericResponse;
  } catch (err) {
    return NextResponse.json({ error: 'Request processing failed' }, { status: 500 });
  }
}
