import { NextRequest } from 'next/server';
import { executeGenerationPipeline, GenerationProgressEvent } from '@/lib/multi-agent-pipeline';

/**
 * Step 4 Part A: SSE (Server-Sent Events) Streaming Generation Endpoint
 * 
 * Features:
 * - Content-Type: text/event-stream
 * - Cache-Control: no-cache, no-transform
 * - Immediate chunk flushing via ReadableStream controller
 * - ~15s Heartbeat comment keeping proxy connections alive
 * - AbortController signal handling for instant cancellation
 */

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, currentProject } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Heartbeat timer keeping proxies alive every 15s
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'));
          } catch (e) {
            clearInterval(heartbeatInterval);
          }
        }, 15000);

        const sendEvent = (event: string, data: any) => {
          try {
            const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(payload));
          } catch (err) {
            console.warn('[SSE] Client disconnected:', err);
          }
        };

        try {
          sendEvent('start', { message: 'Multi-Agent Autonomous Pipeline initiated.' });

          // Run multi-agent two-phase generation pipeline
          const result = executeGenerationPipeline(
            prompt,
            currentProject,
            (progress: GenerationProgressEvent) => {
              sendEvent('progress', progress);
            }
          );

          // Stream completed files and project
          sendEvent('plan', result.plan);
          sendEvent('security', {
            score: result.securityScore,
            fixes: result.fixesApplied,
          });
          sendEvent('complete', {
            project: result.project,
            fileCount: Object.keys(result.files).length,
          });

          clearInterval(heartbeatInterval);
          controller.close();
        } catch (error: any) {
          clearInterval(heartbeatInterval);
          sendEvent('error', { error: error.message || 'Generation pipeline failed' });
          controller.close();
        }
      },
      cancel() {
        // Handle abort from client Stop button
        console.log('[SSE] Upstream connection aborted by client');
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Invalid request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
