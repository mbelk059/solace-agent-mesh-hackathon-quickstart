'use client';

import { AgentStatus, Event } from '../page';

interface AgentVisualizationProps {
  agents: Record<string, AgentStatus>;
  events: Event[];
}

const statusColors: Record<string, string> = {
  idle: '#444',
  processing: '#ffa500',
  success: '#00ff00',
  error: '#ff4444',
  failed: '#cc0000',
};

const statusLabels: Record<string, string> = {
  idle: 'Idle',
  processing: 'Processing',
  success: 'Success',
  error: 'Error',
  failed: 'Failed',
};

export default function AgentVisualization({
  agents,
  events,
}: AgentVisualizationProps) {
  const agentNames = Object.keys(agents);

  // Calculate connections between agents based on recent events
  const connections: Array<{ from: string; to: string; event: Event }> = [];
  events.forEach((event) => {
    if (event.from && event.to) {
      connections.push({ from: event.from, to: event.to, event });
    }
  });

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0a0e10 0%, #121619 100%)',
        border: '1px solid rgba(47, 227, 208, 0.2)',
        borderRadius: '16px',
        padding: '28px 32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      <h2
        style={{
          marginBottom: '24px',
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#e8f4f8',
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #2fe3d0 0%, #a0d8f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Agent Network
      </h2>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          position: 'relative',
          minHeight: '500px',
        }}
      >
        {/* SVG overlay for connections */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          {connections.slice(0, 10).map((conn, idx) => {
            const fromIdx = agentNames.indexOf(conn.from);
            const toIdx = agentNames.indexOf(conn.to);
            if (fromIdx === -1 || toIdx === -1) return null;

            const fromCol = fromIdx % 3;
            const fromRow = Math.floor(fromIdx / 3);
            const toCol = toIdx % 3;
            const toRow = Math.floor(toIdx / 3);

            const x1 = (fromCol + 0.5) * (100 / 3);
            const y1 = (fromRow + 0.5) * (100 / Math.ceil(agentNames.length / 3));
            const x2 = (toCol + 0.5) * (100 / 3);
            const y2 = (toRow + 0.5) * (100 / Math.ceil(agentNames.length / 3));

            return (
              <line
                key={idx}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke={conn.event.color || '#666'}
                strokeWidth="2"
                opacity="0.4"
                strokeDasharray={conn.event.type.includes('error') ? '5,5' : 'none'}
              />
            );
          })}
        </svg>

        {/* Agent boxes */}
        {agentNames.map((name, idx) => {
          const agent = agents[name];
          const statusColor = statusColors[agent.status] || statusColors.idle;
          const col = idx % 3;
          const row = Math.floor(idx / 3);

          return (
            <div
              key={name}
              style={{
                position: 'relative',
                zIndex: 2,
                gridColumn: col + 1,
                gridRow: row + 1,
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(145deg, #0a0e10 0%, #121619 100%)',
                  border: `2px solid ${statusColor}`,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  minHeight: '140px',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow:
                    agent.status === 'processing'
                      ? `0 8px 32px ${statusColor}60, 0 0 40px ${statusColor}30`
                      : '0 4px 16px rgba(0, 0, 0, 0.4)',
                  animation: agent.status === 'processing' ? 'pulse 2s infinite' : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: statusColor,
                      marginRight: '10px',
                      boxShadow: `0 0 12px ${statusColor}`,
                    }}
                  />
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      color: '#e8f4f8',
                    }}
                  >
                    {name}
                  </h3>
                </div>
                
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: '#8fa8b5',
                    marginBottom: '8px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  {statusLabels[agent.status]}
                </div>
                
                {agent.lastEvent && (
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#6a7f8c',
                      marginTop: '10px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      lineHeight: '1.4',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {agent.lastEvent}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}