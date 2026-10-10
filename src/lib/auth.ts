import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'siteforge_secret_jwt_key_2026_super_secure';

// Simple in-memory rate limiter (max requests per window)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ipOrKey: string, maxRequests = 10, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrKey);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ipOrKey, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Password Hashing using PBKDF2
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, combinedHash: string): boolean {
  if (!combinedHash || !combinedHash.includes(':')) return false;
  const [salt, originalHash] = combinedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
}

// HMAC-SHA256 Token Signer
export function signJwt(payload: Record<string, any>, expiresInSeconds = 7 * 86400): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(signatureInput).digest('base64url');
  return `${signatureInput}.${signature}`;
}

export function verifyJwt(token: string): Record<string, any> | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const signatureInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(signatureInput).digest('base64url');

  if (signature !== expectedSignature) {
    return null; // Signature mismatch
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

// Validate same-origin relative path for 'next' parameter to prevent Open Redirects
export function validateNextPath(nextParam?: string | null): string {
  if (!nextParam || typeof nextParam !== 'string') return '/';
  const trimmed = nextParam.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//') && !trimmed.includes('http:') && !trimmed.includes('https:')) {
    return trimmed;
  }
  return '/';
}
