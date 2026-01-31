import { NextRequest } from 'next/server';
import { broadcastEvent } from '../../events-store';

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
