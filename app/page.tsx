'use client';

import { useEffect, useState } from 'react';
import AgentVisualization from './components/AgentVisualization';
import EventTimeline from './components/EventTimeline';
import Controls from './components/Controls';
import AlertCard from './components/AlertCard';

export interface AgentStatus {
  name: string;
  status: 'idle' | 'processing' | 'success' | 'error' | 'failed';
  lastEvent?: string;
  lastUpdate?: number;
}

export interface Alert {
  alert_id: string;
  status: 'active' | 'resolved';
  agents: Record<string, AgentStatus>;
  events: Event[];
  createdAt: number;
  resolvedAt?: number;
}

export interface Event {
  id: string;
  timestamp: number;
  type: string;
  from: string;
  to?: string;
  data?: any;
  color: string;
  alert_id?: string; // Track which alert this event belongs to
}

export default function Home() {
  const [alerts, setAlerts] = useState<Record<string, Alert>>({});
  const [isSimulating, setIsSimulating] = useState(false);

  // Initialize default agent statuses
  const getDefaultAgents = (): Record<string, AgentStatus> => ({
    'Alert Receiver': { name: 'Alert Receiver', status: 'idle' },
    'AI Analyzer': { name: 'AI Analyzer', status: 'idle' },
    'Broadcast Agent': { name: 'Broadcast Agent', status: 'idle' },
    'Camera Agent': { name: 'Camera Agent', status: 'idle' },
    'Tip Processor': { name: 'Tip Processor', status: 'idle' },
    'Geo Intelligence': { name: 'Geo Intelligence', status: 'idle' },
  });

  useEffect(() => {
    // Connect to event stream
    console.log('Connecting to event stream...');
    const eventSource = new EventSource('/api/events');
    
    eventSource.onopen = () => {
      console.log('Event stream connected');
    };
    
    eventSource.onmessage = (e) => {
      try {
        // SSE format: "data: {...}\n\n"
        const data = e.data.trim();
        if (!data) return;
        
        const event = JSON.parse(data);
        console.log('[Frontend] Received event:', event.type, 'from:', event.from);
        handleEvent(event);
      } catch (error) {
        console.error('[Frontend] Error parsing event:', error, 'Raw data:', e.data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Event stream error:', error);
      // Try to reconnect after a delay
      setTimeout(() => {
        eventSource.close();
        // The useEffect will recreate the connection
      }, 3000);
    };

    return () => {
      console.log('Closing event stream');
      eventSource.close();
    };
  }, []);

  const handleEvent = (event: Event) => {
    // Skip system events that don't belong to a specific alert
    if (event.type === 'connected' || event.type === 'simulation_reset') {
      return;
    }
    
    const alertId = event.alert_id || event.data?.alert_id;
    if (!alertId) {
      console.warn('[Frontend] Event missing alert_id:', event.type);
      return;
    }
    
    setAlerts((prev) => {
      const updated = { ...prev };
      
      // Create alert if it doesn't exist
      if (!updated[alertId]) {
        updated[alertId] = {
          alert_id: alertId,
          status: 'active',
          agents: getDefaultAgents(),
          events: [],
          createdAt: event.timestamp,
        };
      }
      
      const alert = updated[alertId];
      
      // Don't add events to resolved alerts (except the resolution event itself)
      if (alert.status === 'resolved' && event.type !== 'alert_resolved') {
        console.warn('[Frontend] Ignoring event for resolved alert:', event.type, alertId);
        return updated;
      }
      
      // Check if event already exists (prevent duplicates)
      const eventExists = alert.events.some(e => e.id === event.id && e.timestamp === event.timestamp);
      if (eventExists) {
        console.warn('[Frontend] Duplicate event ignored:', event.id);
        return updated;
      }
      
      // Add event to alert's event list
      alert.events = [event, ...alert.events].slice(0, 100);
      
      // Update agent status based on event
      if (event.from && alert.agents[event.from]) {
        let newStatus: AgentStatus['status'] = 'processing';
        if (event.type.includes('error') || event.type.includes('failed')) {
          newStatus = 'error';
        } else if (event.type.includes('success') || event.type.includes('completed') || 
                   event.type.includes('initiated') || event.type.includes('created') ||
                   event.type.includes('assessed') || event.type.includes('received') ||
                   event.type.includes('resolved')) {
          newStatus = 'success';
        }
        
        alert.agents[event.from] = {
          ...alert.agents[event.from],
          status: newStatus,
          lastEvent: event.type,
          lastUpdate: Date.now(),
        };
      }

      // Special handling for resolution event
      if (event.type === 'alert_resolved') {
        alert.status = 'resolved';
        alert.resolvedAt = event.timestamp;
        Object.keys(alert.agents).forEach((agentName) => {
          alert.agents[agentName] = {
            ...alert.agents[agentName],
            status: 'success',
            lastEvent: 'Alert Resolved',
            lastUpdate: Date.now(),
          };
        });
      }

      if (event.to && alert.agents[event.to]) {
        alert.agents[event.to] = {
          ...alert.agents[event.to],
          status: 'processing',
          lastEvent: `Received: ${event.type}`,
          lastUpdate: Date.now(),
        };
      }

      return { ...updated };
    });
  };

  const triggerAlert = async () => {
    setIsSimulating(true);
    try {
      console.log('Triggering alert...');
      const response = await fetch('/api/trigger-alert', {
        method: 'POST',
      });
      const data = await response.json();
      console.log('Trigger alert response:', data);
      if (!response.ok) throw new Error(data.error || 'Failed to trigger alert');
    } catch (error) {
      console.error('Error triggering alert:', error);
      alert('Failed to trigger alert. Check console for details.');
    } finally {
      setTimeout(() => setIsSimulating(false), 1000);
    }
  };

  const simulateFailure = async (agentName: string) => {
    try {
      const response = await fetch('/api/simulate-failure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: agentName }),
      });
      if (!response.ok) throw new Error('Failed to simulate failure');
    } catch (error) {
      console.error('Error simulating failure:', error);
    }
  };

  const resetSimulation = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset');
      
      setAlerts({});
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  return (
    <main style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#fff' }}>
          AMBER Alert Simulation
        </h1>
        <p style={{ color: '#888', fontSize: '1.1rem' }}>
          Event-driven multi-agent AI system demonstrating real-time coordination
        </p>
      </div>

      <Controls
        onTriggerAlert={triggerAlert}
        onSimulateFailure={simulateFailure}
        onReset={resetSimulation}
        isSimulating={isSimulating}
        agentNames={Object.keys(getDefaultAgents())}
      />

      {Object.keys(alerts).length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: '#666',
          background: '#1a1a1a',
          borderRadius: '8px',
          marginTop: '30px'
        }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>No active alerts</p>
          <p style={{ fontSize: '0.9rem' }}>Click "Trigger AMBER Alert" to start tracking an alert</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(600px, 1fr))', 
          gap: '20px', 
          marginTop: '30px' 
        }}>
          {Object.values(alerts).map((alert) => (
            <AlertCard 
              key={alert.alert_id} 
              alert={alert}
              onRemove={(alertId) => {
                setAlerts((prev) => {
                  const updated = { ...prev };
                  delete updated[alertId];
                  return updated;
                });
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
