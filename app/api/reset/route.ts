import { NextResponse } from 'next/server';
import { broadcastEvent } from '../events-store';

export async function POST() {
  broadcastEvent({
    id: `event-${Date.now()}`,
    timestamp: Date.now(),
    type: 'simulation_reset',
    from: 'System',
    color: '#888',
  });

  return NextResponse.json({ success: true });
}
