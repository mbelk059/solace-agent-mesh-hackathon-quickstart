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
      const childAge = alertData.child.age;
      const timeSinceAbduction = Math.floor((Date.now() - new Date(alertData.last_known.time).getTime()) / (1000 * 60)); // minutes
      const suspectKnown = alertData.suspect.name !== 'Unknown male';
      
      // AI Analyzer reasoning
      const aiReasoning = [];
      if (childAge < 10) aiReasoning.push(`Child age ${childAge} indicates high vulnerability`);
      if (!suspectKnown) aiReasoning.push('Unknown suspect relationship increases risk');
      if (timeSinceAbduction < 30) aiReasoning.push(`Recent abduction (${timeSinceAbduction} min ago) - critical time window`);
      if (alertData.incident_details.urgency.includes('HIGH')) aiReasoning.push('Incident details indicate high urgency');
      aiReasoning.push('Multiple risk factors present - immediate action required');
      
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
          vehicle: `${alertData.vehicle.color} ${alertData.vehicle.make} ${alertData.vehicle.model}`,
          ai_reasoning: aiReasoning,
          factors_considered: {
            child_age: childAge,
            child_vulnerability: childAge < 10 ? 'High' : 'Medium',
            suspect_relationship: suspectKnown ? 'Known' : 'Unknown',
            time_since_abduction: `${timeSinceAbduction} minutes`,
            location_type: alertData.last_known.location.includes('Highway') || alertData.last_known.location.includes('Park') ? 'Public area' : 'Urban',
            information_quality: 'Good - vehicle details and location available'
          }
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
      const location = alertData.last_known.location;
      const direction = alertData.last_known.direction || 'north';
      
      // Geo Intelligence reasoning
      const geoReasoning = [];
      geoReasoning.push(`Last known location: ${location}`);
      if (direction.includes('north')) {
        geoReasoning.push('Vehicle heading north - prioritizing north corridor and Highway 5');
        geoReasoning.push('Highway 5 is major escape route with multiple exit points');
      }
      geoReasoning.push('Rest stops identified as likely stopping points (30km radius)');
      geoReasoning.push('Zones prioritized by traffic volume and escape probability');
      
      broadcastEvent({
        id: makeEventId('geofence', 2500),
        timestamp: eventTime,
        type: 'geofence_created',
        from: 'Geo Intelligence',
        to: 'Camera Agent',
        alert_id: uniqueAlertId,
        data: { 
          zones: ['north_corridor', 'highway_5', 'rest_stops'],
          center_location: location,
          coordinates: alertData.last_known.coords,
          ai_reasoning: geoReasoning,
          zone_details: {
            north_corridor: { priority: 'high', radius_km: 20, reason: 'Primary escape route, high traffic volume' },
            highway_5: { priority: 'high', radius_km: 15, reason: 'Major highway with multiple exits, likely route' },
            rest_stops: { priority: 'medium', radius_km: 30, reason: 'Potential stopping points, wider search area' }
          }
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
      const tip1 = tipsToSend[0];
      const childSeen = tip1.sighting?.child_seen || false;
      const vehicleMatch = tip1.sighting?.vehicle_match || '';
      const callerReliability = tip1.caller_details?.reliability || '';
      const distance = tip1.location?.distance_from_last_known_km || 0;
      
      // Calculate tip confidence and reasoning
      const tipReasoning = [];
      let confidenceScore = 0.5; // Base confidence
      
      if (childSeen) {
        confidenceScore += 0.3;
        tipReasoning.push('✓ Direct child sighting - highest confidence indicator');
      } else {
        tipReasoning.push('⚠ No child sighting - reduces confidence');
      }
      
      if (vehicleMatch && vehicleMatch.toLowerCase().includes(alertData.vehicle.color.toLowerCase())) {
        confidenceScore += 0.2;
        tipReasoning.push(`✓ Vehicle match confirmed (${alertData.vehicle.color} ${alertData.vehicle.make})`);
      } else if (vehicleMatch) {
        confidenceScore += 0.1;
        tipReasoning.push(`⚠ Partial vehicle match - ${vehicleMatch}`);
      }
      
      if (callerReliability && (callerReliability.toLowerCase().includes('verified') || callerReliability.toLowerCase().includes('previous'))) {
        confidenceScore += 0.2;
        tipReasoning.push(`✓ Verified caller reliability: ${callerReliability}`);
      } else {
        tipReasoning.push(`⚠ Caller reliability unknown - first time contact`);
      }
      
      if (distance < 5) {
        confidenceScore += 0.1;
        tipReasoning.push(`✓ Location plausible - ${distance.toFixed(1)}km from last known location`);
      } else if (distance < 20) {
        tipReasoning.push(`Location reasonable - ${distance.toFixed(1)}km from last known location`);
      } else {
        confidenceScore -= 0.1;
        tipReasoning.push(`⚠ Location distant - ${distance.toFixed(1)}km away, less plausible`);
      }
      
      // Cap confidence at 1.0 (100%)
      confidenceScore = Math.min(confidenceScore, 1.0);
      const confidenceLevel = confidenceScore >= 0.7 ? 'high' : confidenceScore >= 0.5 ? 'medium' : 'low';
      const confidencePct = Math.round(confidenceScore * 100);
      
      broadcastEvent({
        id: makeEventId('tip1', 4000),
        timestamp: eventTime,
        type: 'tip_received',
        from: 'Tip Processor',
        to: 'AI Analyzer',
        alert_id: uniqueAlertId,
        data: { 
          tip_id: tip1.id, 
          confidence: confidenceLevel,
          confidence_score: confidencePct,
          child_name: alertData.child.name,
          location: tip1.location?.description || alertData.last_known.location,
          vehicle_match: vehicleMatch,
          ai_reasoning: tipReasoning,
          factors: {
            child_seen: childSeen,
            vehicle_match: vehicleMatch ? 'Yes' : 'No',
            caller_reliability: callerReliability,
            distance_km: distance.toFixed(1),
            time_since_abduction: 'Recent'
          }
        },
        color: '#00ff00',
      });
    }, 4000);
    
    // Second tip at 5s
    setTimeout(() => {
      const eventTime = Date.now();
      const tip2 = tipsToSend[1];
      const childSeen = tip2.sighting?.child_seen || false;
      const vehicleMatch = tip2.sighting?.vehicle_match || '';
      const callerReliability = tip2.caller_details?.reliability || '';
      const distance = tip2.location?.distance_from_last_known_km || 0;
      const childDescriptionMatch = tip2.sighting?.child_description_match || '';
      const photoSubmitted = tip2.photo_submitted || false;
      
      // Calculate tip confidence and reasoning
      const tipReasoning = [];
      let confidenceScore = 0.5; // Base confidence
      
      if (childSeen) {
        confidenceScore += 0.3;
        tipReasoning.push('✓ Direct child sighting - highest confidence indicator');
        if (childDescriptionMatch) {
          confidenceScore += 0.1;
          tipReasoning.push(`✓ Child description matches alert: ${childDescriptionMatch}`);
        }
      } else {
        tipReasoning.push('⚠ No child sighting - reduces confidence');
      }
      
      if (vehicleMatch && vehicleMatch.toLowerCase().includes(alertData.vehicle.color.toLowerCase())) {
        confidenceScore += 0.2;
        tipReasoning.push(`✓ Strong vehicle match (${alertData.vehicle.color} ${alertData.vehicle.make})`);
      } else if (vehicleMatch) {
        confidenceScore += 0.1;
        tipReasoning.push(`⚠ Partial vehicle match - ${vehicleMatch}`);
      }
      
      if (callerReliability && (callerReliability.toLowerCase().includes('verified') || callerReliability.toLowerCase().includes('previous'))) {
        confidenceScore += 0.2;
        tipReasoning.push(`✓ Verified caller with history: ${callerReliability}`);
      } else {
        tipReasoning.push(`⚠ Caller reliability unknown`);
      }
      
      if (photoSubmitted) {
        confidenceScore += 0.1;
        tipReasoning.push('✓ Photo evidence submitted - increases credibility');
      }
      
      if (distance < 5) {
        confidenceScore += 0.1;
        tipReasoning.push(`✓ Location very plausible - ${distance.toFixed(1)}km from last known location`);
      } else if (distance < 20) {
        tipReasoning.push(`Location reasonable - ${distance.toFixed(1)}km from last known location`);
      } else {
        confidenceScore -= 0.1;
        tipReasoning.push(`⚠ Location distant - ${distance.toFixed(1)}km away`);
      }
      
      // Cap confidence at 1.0 (100%)
      confidenceScore = Math.min(confidenceScore, 1.0);
      const confidenceLevel = confidenceScore >= 0.7 ? 'high' : confidenceScore >= 0.5 ? 'medium' : 'low';
      const confidencePct = Math.round(confidenceScore * 100);
      
      broadcastEvent({
        id: makeEventId('tip2', 5000),
        timestamp: eventTime,
        type: 'tip_received',
        from: 'Tip Processor',
        to: 'AI Analyzer',
        alert_id: uniqueAlertId,
        data: { 
          tip_id: tip2.id, 
          confidence: confidenceLevel,
          confidence_score: confidencePct,
          child_name: alertData.child.name,
          location: tip2.location?.description || alertData.last_known.location,
          vehicle_match: vehicleMatch || `${alertData.vehicle.color} ${alertData.vehicle.make}`,
          ai_reasoning: tipReasoning,
          factors: {
            child_seen: childSeen,
            child_description_match: childDescriptionMatch || 'N/A',
            vehicle_match: vehicleMatch ? 'Yes' : 'No',
            caller_reliability: callerReliability,
            distance_km: distance.toFixed(1),
            photo_submitted: photoSubmitted ? 'Yes' : 'No',
            time_since_abduction: 'Recent'
          }
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
