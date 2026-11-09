import { NextRequest, NextResponse } from 'next/server';
import { getEvents, subscribeToEvents, resetStore, getPolicyConfig } from '@/lib/activity-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format');

  // JSON polling mode fallback
  if (format === 'json') {
    return NextResponse.json({
      success: true,
      events: getEvents(),
      policy: getPolicyConfig(),
    });
  }

  // Server-Sent Events (SSE) mode
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial events dump
      const initialPayload = JSON.stringify({
        type: 'INIT',
        events: getEvents(),
        policy: getPolicyConfig(),
      });
      controller.enqueue(encoder.encode(`data: ${initialPayload}\n\n`));

      // Subscribe to real-time events
      const unsubscribe = subscribeToEvents((event) => {
        try {
          const payload = JSON.stringify({
            type: 'EVENT',
            event,
            policy: getPolicyConfig(),
          });
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          console.error('Error streaming event:', err);
        }
      });

      // Heartbeat to keep connection alive
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

export async function DELETE() {
  resetStore();
  return NextResponse.json({ success: true, message: 'Store reset successfully' });
}
