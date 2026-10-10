import { NextRequest } from 'next/server';
import { runGenerationPipeline } from '@/lib/generator-pipeline';
import { verifyJwt } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const token = req.cookies.get('siteforge_session')?.value;
    const payload = verifyJwt(token || '');
    const userId = payload?.userId || req.cookies.get('siteforge_user')?.value || 'usr-default';

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (step: string, detail?: string, payload?: any) => {
          const data = JSON.stringify({ step, detail, payload, timestamp: Date.now() });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        };

        try {
          const result = await runGenerationPipeline(
            body,
            (step, detail, payload) => {
              sendEvent(step, detail, payload);
            },
            userId
          );
          sendEvent('Done', 'Pipeline finished successfully', { siteId: result.siteId, meta: result.meta });
          controller.close();
        } catch (err: any) {
          sendEvent('Error', err.message || 'Generation pipeline failed');
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Invalid Request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
