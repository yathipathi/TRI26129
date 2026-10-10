import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, redirectUrl: '/login' });
  
  response.cookies.delete('siteforge_session');
  response.cookies.delete('siteforge_user');
  
  return response;
}

export async function GET(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', req.url));
  
  response.cookies.delete('siteforge_session');
  response.cookies.delete('siteforge_user');
  
  return response;
}
