import { NextRequest } from 'next/server';
import { subscribers, broadcastEvent } from '../events-store';

export async function GET(request: NextRequest) {
  console.log('[GET /api/events] Creating new SSE stream');
  
  const stream = new ReadableStream({
    start(controller) {
      subscribers.add(controller);
      console.log(`[SSE] New connection added. Total subscribers: ${subscribers.size}`);
      
      // Send initial connection message
      const initEvent = {
        id: `init-${Date.now()}`,
        timestamp: Date.now(),
        type: 'connected',
        from: 'System',
        color: '#00aaff',
      };
      const data = JSON.stringify(initEvent) + '\n\n';
      try {
        controller.enqueue(new TextEncoder().encode(`data: ${data}`));
        console.log('[SSE] Sent initial connection message');
      } catch (error) {
        console.error('[SSE] Error sending initial message:', error);
      }

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        subscribers.delete(controller);
        console.log(`[SSE] Connection closed. Remaining subscribers: ${subscribers.size}`);
        try {
          controller.close();
        } catch (error) {
          // Ignore errors on close
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// POST endpoint for broadcasting events
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();
    broadcastEvent(event);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Export broadcastEvent for use in other routes
export { broadcastEvent };
