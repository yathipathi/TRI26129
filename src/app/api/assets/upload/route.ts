import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(req: NextRequest): string | null {
  const token = req.cookies.get('siteforge_session')?.value;
  const payload = verifyJwt(token || '');
  return payload?.userId || req.cookies.get('siteforge_user')?.value || null;
}

// Magic bytes check for images
function validateImageMagicBytes(buffer: Buffer, ext: string): boolean {
  if (buffer.length < 4) return false;
  const hex = buffer.toString('hex', 0, 4);

  // PNG: 89504e47, JPG: ffd8ffe0/ffd8ffe1/ffd8ffe2, GIF: 47494638, WEBP: 52494646 (RIFF)
  if (ext === 'png' && !hex.startsWith('89504e47')) return false;
  if ((ext === 'jpg' || ext === 'jpeg') && !hex.startsWith('ffd8')) return false;
  if (ext === 'gif' && !hex.startsWith('47494638')) return false;
  if (ext === 'webp' && !hex.startsWith('52494646')) return false;

  // SVG text check
  if (ext === 'svg') {
    const content = buffer.toString('utf-8');
    if (/<script/i.test(content) || /javascript:/i.test(content) || /onload=/i.test(content)) {
      return false; // Reject malicious SVG with scripts
    }
  }

  return true;
}

export async function POST(req: NextRequest) {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const altText = (formData.get('altText') as string) || '';
    const isDecorative = formData.get('isDecorative') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Size limit check (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image file size exceeds maximum limit of 10 MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
    if (!allowedExts.includes(ext)) {
      return NextResponse.json({ error: 'File format not allowed. Supported: PNG, JPG, WEBP, GIF, SVG' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validateImageMagicBytes(buffer, ext)) {
      return NextResponse.json({ error: 'Security check failed: File header magic bytes do not match expected image format or contain scripts.' }, { status: 400 });
    }

    // Require alt text if not explicitly marked decorative
    if (!isDecorative && (!altText || !altText.trim())) {
      return NextResponse.json({ error: 'Alt text is REQUIRED for accessible non-decorative images' }, { status: 400 });
    }

    // Save to local uploads folder
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const randomName = `img-${crypto.randomUUID().substring(0, 10)}.${ext}`;
    const filePath = path.join(uploadDir, randomName);
    fs.writeFileSync(filePath, buffer);

    const assetUrl = `/uploads/${randomName}`;

    return NextResponse.json({
      success: true,
      assetUrl,
      filename: randomName,
      altText: isDecorative ? '' : altText.trim(),
      isDecorative,
      size: file.size,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Image upload failed' }, { status: 500 });
  }
}
