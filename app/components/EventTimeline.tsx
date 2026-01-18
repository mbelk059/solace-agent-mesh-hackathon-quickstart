'use client';

import { Event } from '../page';

interface EventTimelineProps {
  events: Event[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div style={{ background: '#1a1a1a', borderRadius: '8px', padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '1.5rem' }}>Event Timeline</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {events.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
            No events yet. Trigger an alert to start the simulation.
          </div>
        ) : (
          events.map((event, idx) => (
            <div
              key={`${event.id}-${event.timestamp}-${idx}`}
              style={{
                background: '#2a2a2a',
                borderLeft: `4px solid ${event.color}`,
                padding: '12px',
                borderRadius: '4px',
                fontSize: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 'bold', color: event.color }}>
                  {event.type}
                </span>
                <span style={{ color: '#888', fontSize: '0.75rem' }}>
                  {formatTime(event.timestamp)}
                </span>
              </div>
              <div style={{ color: '#aaa', fontSize: '0.8rem' }}>
                {event.from && <span>From: {event.from}</span>}
                {event.to && <span style={{ marginLeft: '10px' }}>→ {event.to}</span>}
              </div>
              {event.data && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px',
                    background: '#1a1a1a',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#999',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {JSON.stringify(event.data, null, 2).slice(0, 100)}
                  {JSON.stringify(event.data).length > 100 && '...'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
