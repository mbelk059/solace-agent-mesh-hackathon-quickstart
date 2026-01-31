'use client';

import { Alert, AgentStatus, Event } from '../page';
import AgentVisualization from './AgentVisualization';
import EventTimeline from './EventTimeline';

interface AlertCardProps {
  alert: Alert;
  onRemove?: (alertId: string) => void;
}

export default function AlertCard({ alert, onRemove }: AlertCardProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    return status === 'resolved' ? '#00ff00' : '#ffa500';
  };

  const getStatusLabel = (status: string) => {
    return status === 'resolved' ? 'Resolved' : 'Active';
  };

  return (
    <div style={{
      background: '#1a1a1a',
      borderRadius: '8px',
      padding: '20px',
      border: `2px solid ${getStatusColor(alert.status)}`,
    }}>
      {/* Alert Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #333'
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '5px', color: '#fff' }}>
            {alert.alert_id}
          </h2>
          <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#888' }}>
            <span>Created: {formatTime(alert.createdAt)}</span>
            {alert.resolvedAt && (
              <span>Resolved: {formatTime(alert.resolvedAt)}</span>
            )}
          </div>
        </div>
        <div style={{
          padding: '8px 16px',
          background: getStatusColor(alert.status) + '20',
          border: `1px solid ${getStatusColor(alert.status)}`,
          borderRadius: '6px',
          color: getStatusColor(alert.status),
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}>
          {getStatusLabel(alert.status)}
        </div>
      </div>

      {/* Agent Network and Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
        <AgentVisualization 
          agents={alert.agents} 
          events={alert.events.slice(0, 20)} 
        />
        <EventTimeline events={alert.events} />
      </div>

      {/* Event Count and Remove Button */}
      <div style={{ 
        marginTop: '15px', 
        paddingTop: '15px', 
        borderTop: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#888' }}>
          {alert.events.length} event{alert.events.length !== 1 ? 's' : ''} tracked
        </div>
        {alert.status === 'resolved' && onRemove && (
          <button
            onClick={() => onRemove(alert.alert_id)}
            style={{
              padding: '6px 12px',
              background: '#cc0000',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 'bold',
            }}
          >
            Remove Case
          </button>
        )}
      </div>
    </div>
  );
}
