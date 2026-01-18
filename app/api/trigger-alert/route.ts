import { NextResponse } from 'next/server';
import { broadcastEvent, subscribers } from '../events-store';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Read alert data from JSON file
    const alertPath = path.join(process.cwd(), 'data', 'amber_alert.json');
    
    if (!fs.existsSync(alertPath)) {
      console.error(`Alert file not found at: ${alertPath}`);
      return NextResponse.json(
        { success: false, error: `Alert file not found at: ${alertPath}` },
        { status: 404 }
      );
    }
    
    const alertData = JSON.parse(fs.readFileSync(alertPath, 'utf-8'));
    console.log('[trigger-alert] Alert data loaded:', alertData.alert_id);
    console.log('[trigger-alert] Current subscribers:', subscribers.size);

    // Emit alert_reported event immediately
    const firstEvent = {
      id: `event-${Date.now()}`,
      timestamp: Date.now(),
      type: 'alert_reported',
      from: 'Alert Receiver',
      data: { alert_id: alertData.alert_id },
      color: '#ff4444',
    };
    console.log('[trigger-alert] Broadcasting first event:', firstEvent.type);
    broadcastEvent(firstEvent);

    // Simulate agent processing with delays
    setTimeout(() => {
      broadcastEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'alert_assessed',
        from: 'AI Analyzer',
        to: 'Broadcast Agent',
        data: { priority: 'HIGH', urgency: alertData.incident_details.urgency },
        color: '#ffa500',
      });
    }, 1000);

    setTimeout(() => {
      broadcastEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'broadcast_initiated',
        from: 'Broadcast Agent',
        data: { channels: ['phones', 'highway_signs', 'radio', 'tv', 'social'] },
        color: '#00ff00',
      });
    }, 2000);

    setTimeout(() => {
      broadcastEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'geofence_created',
        from: 'Geo Intelligence',
        to: 'Camera Agent',
        data: { zones: ['north_corridor', 'highway_5', 'rest_stops'] },
        color: '#00aaff',
      });
    }, 2500);

    setTimeout(() => {
      broadcastEvent({
        id: `event-${Date.now()}`,
        timestamp: Date.now(),
        type: 'camera_scanning',
        from: 'Camera Agent',
        data: { status: 'scanning', cameras: 12 },
        color: '#ffa500',
      });
    }, 3000);

    // Simulate tips coming in
    // Schedule tips to arrive at 4s and 5s, then resolution at 6s
    const tipsPath = path.join(process.cwd(), 'data', 'tips.json');
    const tipsData = JSON.parse(fs.readFileSync(tipsPath, 'utf-8'));
    const tipsToSend = tipsData.tips.slice(0, 2);
    
    // First tip at 4s
    setTimeout(() => {
      broadcastEvent({
        id: `event-${Date.now()}-0`,
        timestamp: Date.now(),
        type: 'tip_received',
        from: 'Tip Processor',
        to: 'AI Analyzer',
        data: { tip_id: tipsToSend[0].id, confidence: 'high' },
        color: '#00ff00',
      });
    }, 4000);
    
    // Second tip at 5s
    setTimeout(() => {
      broadcastEvent({
        id: `event-${Date.now()}-1`,
        timestamp: Date.now(),
        type: 'tip_received',
        from: 'Tip Processor',
        to: 'AI Analyzer',
        data: { tip_id: tipsToSend[1].id, confidence: 'high' },
        color: '#00ff00',
      });
    }, 5000);

    // Simulate resolution after tips lead to recovery
    // Both tips complete by 5s, so resolution at 6s
    setTimeout(() => {
      const resolutionsPath = path.join(process.cwd(), 'data', 'resolutions.json');
      const resolutionsData = JSON.parse(fs.readFileSync(resolutionsPath, 'utf-8'));
      const resolution = resolutionsData.resolutions[0];
      
      console.log('[trigger-alert] Broadcasting resolution event');
      broadcastEvent({
        id: `event-${Date.now()}-resolution`,
        timestamp: Date.now(),
        type: 'alert_resolved',
        from: 'System',
        data: {
          resolution_type: resolution.resolution_type,
          child_status: resolution.resolution_details.child_status,
          suspect_status: resolution.resolution_details.suspect_status,
          total_duration: resolution.timeline.total_duration,
          location: resolution.resolution_details.location,
        },
        color: '#00ff00',
      });
    }, 6000); // After both tips (4s and 5s), resolution at 6s

    return NextResponse.json({ success: true, message: 'Alert triggered' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
