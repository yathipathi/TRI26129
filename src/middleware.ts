import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'siteforge_secret_jwt_key_2026_super_secure';

// Public routes allowlist
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
];

// Helper to check if a path is public
function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  if (pathname.startsWith('/api/auth')) return true;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/templates/') || // Static starter template HTML assets
    pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|svg|css|js|woff|woff2)$/i.test(pathname)
  ) {
    return true;
  }
  return false;
}

// Same-origin relative path validator for 'next' parameter
function validateNextPath(nextParam?: string | null): string {
  if (!nextParam || typeof nextParam !== 'string') return '/';
  const trimmed = nextParam.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('http:') && !trimmed.includes('https:')) {
    return trimmed;
  }
  return '/';
}

// Edge-compatible JWT verifier using HMAC SHA-256
async function verifyToken(token: string): Promise<{ userId: string; email: string } | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert signature from base64url to Uint8Array
    const base64Sig = signature.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64Sig.length % 4)) % 4;
    const paddedBase64Sig = base64Sig + '='.repeat(padLen);
    const sigBytes = Uint8Array.from(atob(paddedBase64Sig), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(signatureInput));
    if (!isValid) return null;

    // Decode payload
    const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = base64Payload + '='.repeat((4 - (base64Payload.length % 4)) % 4);
    const payloadJson = atob(paddedPayload);
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired token
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const sessionCookie = req.cookies.get('siteforge_session')?.value;

  const session = sessionCookie ? await verifyToken(sessionCookie) : null;
  const isAuthenticated = !!session;

  // 1. Authenticated user visiting /login or /signup -> redirect to / (or validated next path)
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    const nextPath = validateNextPath(searchParams.get('next'));
    return NextResponse.redirect(new URL(nextPath, req.url));
  }

  // 2. Allow public paths unconditionally
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 3. Unauthenticated request to protected path
  if (!isAuthenticated) {
    // A) Protected API routes -> Return 401 JSON
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized', message: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // B) Protected Pages -> 302 Redirect to /login?next=<original_path>
    const nextPath = validateNextPath(pathname + (req.nextUrl.search || ''));
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('next', nextPath);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated request -> attach user info header and proceed
  const response = NextResponse.next();
  if (session?.userId) {
    response.headers.set('x-siteforge-user-id', session.userId);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
