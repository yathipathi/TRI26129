import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dns from 'dns/promises';
import { verifyJwt } from '@/lib/auth';
import { isPrivateIP } from '@/lib/sanitizer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { externalUrl, altText, isDecorative } = await req.json();

    if (!externalUrl || typeof externalUrl !== 'string') {
      return NextResponse.json({ error: 'External URL is required' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(externalUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // SSRF Check: Block non-http/https protocols
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return NextResponse.json({ error: 'Only HTTP and HTTPS URLs are supported' }, { status: 400 });
    }

    // SSRF Check: Resolve hostname and block private/loopback IP ranges
    try {
      const addresses = await dns.lookup(parsedUrl.hostname);
      if (isPrivateIP(addresses.address)) {
        return NextResponse.json(
          { error: `SSRF Security Block: Access to private/loopback IP address (${addresses.address}) is forbidden.` },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json({ error: `Failed to resolve hostname: ${parsedUrl.hostname}` }, { status: 400 });
    }

    // Fetch external image server-side with 5s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const fetchRes = await fetch(externalUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SiteForge-AssetRehost/1.0' },
    });
    clearTimeout(timeoutId);

    if (!fetchRes.ok) {
      return NextResponse.json({ error: `Failed to fetch image from external URL (Status ${fetchRes.status})` }, { status: 400 });
    }

    const arrayBuffer = await fetchRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'External image exceeds size limit of 10 MB' }, { status: 400 });
    }

    // Determine extension
    const contentType = fetchRes.headers.get('content-type') || '';
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('gif')) ext = 'gif';
    else if (contentType.includes('svg')) ext = 'svg';

    // Save to public uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `rehosted-${crypto.randomUUID().substring(0, 10)}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    const assetUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      assetUrl,
      originalUrl: externalUrl,
      altText: isDecorative ? '' : altText || 'External image asset',
      isDecorative: !!isDecorative,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'SSRF verification / image re-hosting failed' }, { status: 500 });
  }
}
