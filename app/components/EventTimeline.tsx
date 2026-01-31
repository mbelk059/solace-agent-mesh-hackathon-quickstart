'use client';

import { useState } from 'react';
import { Event } from '../page';

interface EventTimelineProps {
  events: Event[];
}

export default function EventTimeline({ events }: EventTimelineProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const hasAIReasoning = (event: Event): boolean => {
    return event.from === 'AI Analyzer' || event.from === 'Geo Intelligence' || 
           (event.from === 'Tip Processor' && event.type === 'tip_received');
  };

  const renderAIReasoning = (event: Event) => {
    if (!event.data) return null;

    const data = event.data;
    const reasoning = data.ai_reasoning;
    const isExpanded = expandedEvents.has(event.id);

    if (!reasoning || !Array.isArray(reasoning)) return null;

    if (event.from === 'AI Analyzer') {
      const factors = data.factors_considered || {};
      return (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => toggleEventExpansion(event.id)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255, 165, 0, 0.08)',
              border: '1px solid rgba(255, 165, 0, 0.3)',
              borderRadius: '8px',
              color: '#ffa500',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🤖 AI Decision Reasoning</span>
            <span>{isExpanded ? '▼' : '▶'}</span>
          </button>
          {isExpanded && (
            <div
              style={{
                marginTop: '10px',
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 165, 0, 0.2)',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#ffa500', fontWeight: 700, marginBottom: '8px', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  Decision: Priority = {data.priority}
                </div>
                <div style={{ color: '#b8c8d0', fontSize: '0.78rem', marginBottom: '12px' }}>
                  <strong style={{ color: '#e8f4f8' }}>Reasoning:</strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.6' }}>
                    {reasoning.map((reason: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '5px' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {Object.keys(factors).length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ color: '#8fa8b5', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Factors Considered:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem', color: '#6a7f8c' }}>
                    {Object.entries(factors).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8fa8b5' }}>{key.replace(/_/g, ' ')}:</span>
                        <span style={{ color: '#e8f4f8', fontWeight: 700 }}>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (event.from === 'Geo Intelligence') {
      const zoneDetails = data.zone_details || {};
      return (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => toggleEventExpansion(event.id)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(0, 170, 255, 0.08)',
              border: '1px solid rgba(0, 170, 255, 0.3)',
              borderRadius: '8px',
              color: '#00aaff',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🗺️ AI Decision Reasoning</span>
            <span>{isExpanded ? '▼' : '▶'}</span>
          </button>
          {isExpanded && (
            <div
              style={{
                marginTop: '10px',
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 170, 255, 0.2)',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#00aaff', fontWeight: 700, marginBottom: '8px', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  Decision: Created {Array.isArray(data.zones) ? data.zones.length : 0} Geofence Zones
                </div>
                <div style={{ color: '#b8c8d0', fontSize: '0.78rem', marginBottom: '12px' }}>
                  <strong style={{ color: '#e8f4f8' }}>Reasoning:</strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.6' }}>
                    {reasoning.map((reason: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '5px' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {Object.keys(zoneDetails).length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ color: '#8fa8b5', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Zone Details:
                  </div>
                  {Object.entries(zoneDetails).map(([zoneName, zoneInfo]: [string, any]) => (
                    <div key={zoneName} style={{ marginBottom: '10px', padding: '10px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px' }}>
                      <div style={{ color: '#00aaff', fontWeight: 700, fontSize: '0.8rem', marginBottom: '5px', letterSpacing: '0.4px' }}>
                        {zoneName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8fa8b5', marginBottom: '5px' }}>
                        Priority: <span style={{ color: zoneInfo.priority === 'high' ? '#ffa500' : '#6a7f8c', fontWeight: 700 }}>{zoneInfo.priority.toUpperCase()}</span>
                        {' • '}Radius: {zoneInfo.radius_km}km
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#b8c8d0', fontStyle: 'italic' }}>
                        {zoneInfo.reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    if (event.from === 'Tip Processor' && event.type === 'tip_received') {
      const factors = data.factors;
      const confidenceScore = data.confidence_score || 0;
      const confidenceLevel = data.confidence || 'unknown';

      return (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => toggleEventExpansion(event.id)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(0, 255, 0, 0.08)',
              border: '1px solid rgba(0, 255, 0, 0.3)',
              borderRadius: '8px',
              color: '#00ff00',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <span>🎯 Tip Confidence Analysis</span>
            <span>{isExpanded ? '▼' : '▶'}</span>
          </button>
          {isExpanded && (
            <div
              style={{
                marginTop: '10px',
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                border: '1px solid rgba(0, 255, 0, 0.2)',
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <div style={{ color: '#00ff00', fontWeight: 700, marginBottom: '8px', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                  Decision: Confidence = {confidenceLevel.toUpperCase()} ({confidenceScore}%)
                </div>
                <div style={{ color: '#b8c8d0', fontSize: '0.78rem', marginBottom: '12px' }}>
                  <strong style={{ color: '#e8f4f8' }}>Reasoning:</strong>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px', lineHeight: '1.6' }}>
                    {reasoning.map((reason: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '5px' }}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {factors && Object.keys(factors).length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ color: '#8fa8b5', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Factors Analyzed:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.72rem', color: '#6a7f8c' }}>
                    {Object.entries(factors).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#8fa8b5' }}>{key.replace(/_/g, ' ')}:</span>
                        <span style={{ 
                          color: typeof value === 'string' && (value.toLowerCase() === 'yes' || value.toLowerCase() === 'true') 
                            ? '#00ff00' 
                            : typeof value === 'string' && (value.toLowerCase() === 'no' || value.toLowerCase() === 'false')
                            ? '#ff6666'
                            : '#e8f4f8',
                          fontWeight: 700
                        }}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const formatEventData = (event: Event): string => {
    if (!event.data) return '';

    const data = event.data;

    switch (event.type) {
      case 'alert_reported':
        return `Alert ID: ${data.alert_id || data.original_alert_id || 'Unknown'}`;

      case 'alert_assessed':
        const parts = [];
        if (data.priority) parts.push(`Priority: ${data.priority}`);
        if (data.urgency) parts.push(`Urgency: ${data.urgency}`);
        if (data.child_name) parts.push(`Child: ${data.child_name}`);
        if (data.location) parts.push(`Location: ${data.location}`);
        if (data.vehicle) parts.push(`Vehicle: ${data.vehicle}`);
        return parts.join(' • ') || 'Assessment completed';

      case 'broadcast_initiated':
        const channelList = Array.isArray(data.channels) 
          ? data.channels.join(', ') 
          : data.channels || 'Unknown channels';
        const childInfo = data.child_name ? ` for ${data.child_name}` : '';
        return `Broadcasting to: ${channelList}${childInfo}`;

      case 'geofence_created':
        const zones = Array.isArray(data.zones) 
          ? data.zones.join(', ') 
          : data.zones || 'Unknown zones';
        const center = data.center_location || data.coordinates?.lat 
          ? ` around ${data.center_location || `${data.coordinates.lat}, ${data.coordinates.lon}`}`
          : '';
        return `Created zones: ${zones}${center}`;

      case 'camera_scanning':
        const status = data.status || 'scanning';
        const cameras = data.cameras ? `${data.cameras} cameras` : '';
        const vehicle = data.target_vehicle ? ` for ${data.target_vehicle}` : '';
        const area = data.search_area ? ` in ${data.search_area}` : '';
        return `${status.charAt(0).toUpperCase() + status.slice(1)}${cameras ? ` with ${cameras}` : ''}${vehicle}${area}`;

      case 'tip_received':
        const tipParts = [];
        if (data.tip_id) tipParts.push(`Tip ID: ${data.tip_id}`);
        if (data.confidence) tipParts.push(`Confidence: ${data.confidence}`);
        if (data.child_name) tipParts.push(`Child: ${data.child_name}`);
        if (data.location) tipParts.push(`Location: ${data.location}`);
        if (data.vehicle_match) tipParts.push(`Vehicle: ${data.vehicle_match}`);
        return tipParts.join(' • ') || 'Tip received';

      case 'alert_resolved':
        const resolutionParts = [];
        if (data.resolution_type) {
          const resolutionType = data.resolution_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          resolutionParts.push(`Resolution: ${resolutionType}`);
        }
        if (data.child_status) {
          const childStatus = data.child_status.length > 60 
            ? data.child_status.substring(0, 60) + '...' 
            : data.child_status;
          resolutionParts.push(`Child: ${childStatus}`);
        }
        if (data.suspect_status) {
          resolutionParts.push(`Suspect: ${data.suspect_status}`);
        }
        if (data.total_duration) {
          resolutionParts.push(`Duration: ${data.total_duration}`);
        }
        if (data.location) {
          resolutionParts.push(`Location: ${data.location}`);
        }
        return resolutionParts.join(' • ') || 'Alert resolved';

      case 'tip_processed':
        const processedParts = [];
        if (data.tip_id) processedParts.push(`Tip ID: ${data.tip_id}`);
        if (data.confidence !== undefined) processedParts.push(`Confidence: ${data.confidence}%`);
        return processedParts.join(' • ') || 'Tip processed';

      case 'suspect_detected':
        const detectionParts = [];
        if (data.zone) detectionParts.push(`Zone: ${data.zone}`);
        if (data.confidence !== undefined) detectionParts.push(`Confidence: ${data.confidence}%`);
        if (data.timestamp) {
          const time = new Date(data.timestamp).toLocaleTimeString();
          detectionParts.push(`Time: ${time}`);
        }
        return detectionParts.join(' • ') || 'Suspect detected';

      case 'camera_scan_complete':
        const scanParts = [];
        if (data.zones_scanned) scanParts.push(`Zones: ${data.zones_scanned}`);
        if (data.cameras_active) scanParts.push(`Cameras: ${data.cameras_active}`);
        if (data.detection !== undefined) {
          scanParts.push(`Detection: ${data.detection ? 'Yes' : 'No'}`);
        }
        return scanParts.join(' • ') || 'Scan complete';

      case 'agent_failed':
        const failureParts = [];
        if (data.reason) failureParts.push(data.reason);
        if (data.agent) failureParts.push(`Agent: ${data.agent}`);
        return failureParts.join(' • ') || 'Agent failure detected';

      case 'agent_recovered':
        const recoveryParts = [];
        if (data.agent) recoveryParts.push(`Agent: ${data.agent}`);
        if (data.recovery_time) recoveryParts.push(`Recovery time: ${data.recovery_time}`);
        return recoveryParts.join(' • ') || 'Agent recovered';

      default:
        const defaultParts = [];
        if (data.status) defaultParts.push(`Status: ${data.status}`);
        if (data.message) defaultParts.push(data.message);
        if (data.error) defaultParts.push(`Error: ${data.error}`);
        if (defaultParts.length === 0 && typeof data === 'object') {
          const entries = Object.entries(data).slice(0, 3);
          return entries.map(([key, value]) => {
            const val = typeof value === 'string' && value.length > 30 
              ? value.substring(0, 30) + '...' 
              : String(value);
            return `${key}: ${val}`;
          }).join(' • ');
        }
        return defaultParts.join(' • ') || '';
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #0a0e10 0%, #121619 100%)',
        border: '1px solid rgba(47, 227, 208, 0.2)',
        borderRadius: '16px',
        padding: '28px 32px',
        maxHeight: '600px',
        overflowY: 'auto',
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
        Event Timeline
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {events.length === 0 ? (
          <div
            style={{
              color: '#6a7f8c',
              textAlign: 'center',
              padding: '48px 20px',
              fontSize: '0.85rem',
              letterSpacing: '0.5px',
            }}
          >
            No events yet. Trigger an alert to start the simulation.
          </div>
        ) : (
          events.map((event, idx) => (
            <div
              key={`${event.id}-${event.timestamp}-${idx}`}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderLeft: `3px solid ${event.color}`,
                padding: '14px 16px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: event.color,
                    letterSpacing: '0.5px',
                    fontSize: '0.85rem',
                  }}
                >
                  {event.type}
                </span>
                <span
                  style={{
                    color: '#6a7f8c',
                    fontSize: '0.72rem',
                    letterSpacing: '0.3px',
                    fontWeight: 600,
                  }}
                >
                  {formatTime(event.timestamp)}
                </span>
              </div>

              <div
                style={{
                  color: '#8fa8b5',
                  fontSize: '0.78rem',
                  letterSpacing: '0.4px',
                }}
              >
                {event.from && <span>From: {event.from}</span>}
                {event.to && (
                  <span style={{ marginLeft: '12px' }}>→ {event.to}</span>
                )}
              </div>

              {event.data && (
                <>
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      background: 'rgba(0, 0, 0, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      color: '#b8c8d0',
                      lineHeight: '1.5',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {formatEventData(event) || 'No details available'}
                  </div>
                  {hasAIReasoning(event) && renderAIReasoning(event)}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}