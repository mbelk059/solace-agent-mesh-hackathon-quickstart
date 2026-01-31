import { NextResponse } from 'next/server';
import { broadcastEvent } from '../events-store';

export async function POST(request: Request) {
  try {
    const { agent } = await request.json();

    // Emit failure event
    broadcastEvent({
      id: `event-${Date.now()}`,
      timestamp: Date.now(),
      type: 'agent_failed',
      from: agent,
      data: { reason: 'Simulated failure', agent },
      color: '#cc0000',
    });

    // Simulate recovery after 3 seconds
    setTimeout(() => {
      broadcastEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'agent_recovered',
        from: agent,
        data: { agent, recovery_time: '3s' },
        color: '#00ff00',
      });
    }, 3000);

    return NextResponse.json({ success: true, message: `Failure simulated for ${agent}` });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
