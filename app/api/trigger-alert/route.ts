import { NextResponse } from 'next/server';
import { broadcastEvent, subscribers } from '../events-store';
import fs from 'fs';
import path from 'path';

// Track alert count to determine duration for first alert
let alertCount = 0;

export async function POST() {
  try {
    alertCount++;
    
    // Read alert data from JSON file
    const alertPath = path.join(process.cwd(), 'data', 'amber_alert.json');
    
    if (!fs.existsSync(alertPath)) {
      console.error(`Alert file not found at: ${alertPath}`);
      return NextResponse.json(
        { success: false, error: `Alert file not found at: ${alertPath}` },
        { status: 404 }
      );
    }
    
    const baseAlertData = JSON.parse(fs.readFileSync(alertPath, 'utf-8'));
    
    // Generate variations for different cases
    const variations = [
      { child_name: 'Emma Rodriguez', location: 'Gatineau Park', vehicle: 'Blue Honda Civic' },
      { child_name: 'James Wilson', location: 'Downtown Ottawa', vehicle: 'Red Toyota Camry' },
      { child_name: 'Sophie Chen', location: 'Rideau Centre', vehicle: 'White Ford Escape' },
      { child_name: 'Michael Brown', location: 'ByWard Market', vehicle: 'Black Chevrolet Malibu' },
      { child_name: 'Olivia Martinez', location: 'Parliament Hill', vehicle: 'Silver Nissan Altima' },
    ];
    
    const variation = variations[(alertCount - 1) % variations.length];
    
    // Create modified alert data
    const alertData = {
      ...baseAlertData,
      alert_id: `AMBER-CA-2026-${String(alertCount).padStart(3, '0')}`,
      child: {
        ...baseAlertData.child,
        name: variation.child_name,
      },
      vehicle: {
        ...baseAlertData.vehicle,
        color: variation.vehicle.split(' ')[0],
        make: variation.vehicle.split(' ')[1],
        model: variation.vehicle.split(' ').slice(2).join(' '),
      },
      last_known: {
        ...baseAlertData.last_known,
        location: variation.location,
      },
    };
    
    // Generate unique alert ID for this simulation run
    const uniqueAlertId = `${alertData.alert_id}-${Date.now()}`;
    
    // Determine duration: first alert = 30s, others = random 10-30s
    const duration = alertCount === 1 ? 30000 : (10000 + Math.floor(Math.random() * 20000));
    const resolutionTime = duration;
    
    console.log('[trigger-alert] Alert data loaded:', uniqueAlertId, 'Duration:', duration + 'ms');
    console.log('[trigger-alert] Current subscribers:', subscribers.size);

    // Emit alert_reported event immediately
    const baseTimestamp = Date.now();
    const firstEvent = {
      id: `event-${baseTimestamp}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: baseTimestamp,
      type: 'alert_reported',
      from: 'Alert Receiver',
      alert_id: uniqueAlertId,
      data: { alert_id: uniqueAlertId, original_alert_id: alertData.alert_id },
      color: '#ff4444',
    };
    console.log('[trigger-alert] Broadcasting first event:', firstEvent.type);
    broadcastEvent(firstEvent);

    // Helper to generate unique event IDs
    const makeEventId = (type: string, delay: number) => {
      return `event-${baseTimestamp + delay}-${type}-${Math.random().toString(36).substr(2, 9)}`;
    };

    // Simulate agent processing with delays - all events include alert_id with unique data
    setTimeout(() => {
      const eventTime = Date.now();
      broadcastEvent({
        id: makeEventId('assessed', 1000),
        timestamp: eventTime,
        type: 'alert_assessed',
        from: 'AI Analyzer',
        to: 'Broadcast Agent',
        alert_id: uniqueAlertId,
        data: { 
          priority: 'HIGH', 
          urgency: alertData.incident_details.urgency,
          child_name: alertData.child.name,
          location: alertData.last_known.location,
          vehicle: `${alertData.vehicle.color} ${alertData.vehicle.make} ${alertData.vehicle.model}`
        },
        color: '#ffa500',
      });
    }, 1000);

    setTimeout(() => {
      const eventTime = Date.now();
      broadcastEvent({
        id: makeEventId('broadcast', 2000),
        timestamp: eventTime,
        type: 'broadcast_initiated',
        from: 'Broadcast Agent',
        alert_id: uniqueAlertId,
        data: { 
          channels: ['phones', 'highway_signs', 'radio', 'tv', 'social'],
          alert_id: alertData.alert_id,
          child_name: alertData.child.name
        },
        color: '#00ff00',
      });
    }, 2000);

    setTimeout(() => {
      const eventTime = Date.now();
      broadcastEvent({
        id: makeEventId('geofence', 2500),
        timestamp: eventTime,
        type: 'geofence_created',
        from: 'Geo Intelligence',
        to: 'Camera Agent',
        alert_id: uniqueAlertId,
        data: { 
          zones: ['north_corridor', 'highway_5', 'rest_stops'],
          center_location: alertData.last_known.location,
          coordinates: alertData.last_known.coords
        },
        color: '#00aaff',
      });
    }, 2500);

    setTimeout(() => {
      const eventTime = Date.now();
      broadcastEvent({
        id: makeEventId('camera', 3000),
        timestamp: eventTime,
        type: 'camera_scanning',
        from: 'Camera Agent',
        alert_id: uniqueAlertId,
        data: { 
          status: 'scanning', 
          cameras: 12,
          target_vehicle: `${alertData.vehicle.color} ${alertData.vehicle.make} ${alertData.vehicle.model}`,
          search_area: alertData.last_known.location
        },
        color: '#ffa500',
      });
    }, 3000);

    // Simulate tips coming in - schedule them to complete before resolution
    // Tips will arrive at 4s and 5s, resolution happens at variable time (10-30s)
    const tipsPath = path.join(process.cwd(), 'data', 'tips.json');
    const tipsData = JSON.parse(fs.readFileSync(tipsPath, 'utf-8'));
    const tipsToSend = tipsData.tips.slice(0, 2);
    
    // First tip at 4s
    setTimeout(() => {
      const eventTime = Date.now();
      broadcastEvent({
        id: makeEventId('tip1', 4000),
        timestamp: eventTime,
        type: 'tip_received',
        from: 'Tip Processor',
        to: 'AI Analyzer',
        alert_id: uniqueAlertId,
        data: { 
          tip_id: tipsToSend[0].id, 
          confidence: 'high',
          child_name: alertData.child.name,
          location: alertData.last_known.location
        },
        color: '#00ff00',
      });
    }, 4000);
    
    // Second tip at 5s
    setTimeout(() => {
      const eventTime = Date.now();
      broadcastEvent({
        id: makeEventId('tip2', 5000),
        timestamp: eventTime,
        type: 'tip_received',
        from: 'Tip Processor',
        to: 'AI Analyzer',
        alert_id: uniqueAlertId,
        data: { 
          tip_id: tipsToSend[1].id, 
          confidence: 'high',
          child_name: alertData.child.name,
          vehicle_match: `${alertData.vehicle.color} ${alertData.vehicle.make}`
        },
        color: '#00ff00',
      });
    }, 5000);

    // Simulate resolution after tips lead to recovery
    // Resolution time is variable: first alert = 30s, others = random 10-30s
    // Resolution MUST be the last event, so we schedule it at the full duration time
    // Tips complete at 5s, so for short durations (10s), resolution happens at 10s (5s after tips)
    // For longer durations, resolution happens much later
    console.log(`[trigger-alert] Alert ${uniqueAlertId} will resolve in ${resolutionTime}ms`);
    
    setTimeout(() => {
      const resolutionsPath = path.join(process.cwd(), 'data', 'resolutions.json');
      const resolutionsData = JSON.parse(fs.readFileSync(resolutionsPath, 'utf-8'));
      const resolution = resolutionsData.resolutions[0];
      const eventTime = Date.now();
      
      console.log('[trigger-alert] Broadcasting resolution event for', uniqueAlertId, 'at', resolutionTime, 'ms');
      broadcastEvent({
        id: makeEventId('resolved', resolutionTime),
        timestamp: eventTime,
        type: 'alert_resolved',
        from: 'System',
        alert_id: uniqueAlertId,
        data: {
          resolution_type: resolution.resolution_type,
          child_status: resolution.resolution_details.child_status,
          suspect_status: resolution.resolution_details.suspect_status,
          total_duration: `${Math.round(resolutionTime / 1000)} seconds`,
          location: alertData.last_known.location,
          child_name: alertData.child.name,
          alert_id: alertData.alert_id,
        },
        color: '#00ff00',
      });
    }, resolutionTime); // Resolution happens at the full duration time

    return NextResponse.json({ success: true, message: 'Alert triggered' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
