import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.cookies.get('siteforge_session')?.value;
    const payload = verifyJwt(token || '');
    const userId = payload?.userId || req.cookies.get('siteforge_user')?.value;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Security Check 1: Executable extensions check
    const filename = file.name.toLowerCase();
    if (filename.endsWith('.exe') || filename.endsWith('.js') || filename.endsWith('.php') || filename.endsWith('.sh') || filename.endsWith('.bat')) {
      return NextResponse.json({ error: 'Executable files are strictly forbidden.' }, { status: 400 });
    }

    // Security Check 2: MIME Type & Size validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid image type (${file.type}). Allowed: PNG, JPEG, SVG, WebP, GIF.` }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File size exceeds 5 MB limit (${(file.size / 1024 / 1024).toFixed(2)} MB).` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.png';
    const randomName = `img-${crypto.randomBytes(8).toString('hex')}${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', id);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, randomName);
    fs.writeFileSync(filePath, buffer);

    const assetUrl = `/uploads/${id}/${randomName}`;

    return NextResponse.json({ success: true, url: assetUrl, filename: randomName });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Asset upload failed' }, { status: 500 });
  }
}
