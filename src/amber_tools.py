"""
AMBER Alert simulation tools for SAM agents.

These tools enable agents to:
- Read alert data from JSON files
- Process tips and assess urgency
- Publish events to the visualization system
"""

import json
import logging
import os
import time
from datetime import datetime
from typing import Any, Dict, Optional
import httpx

log = logging.getLogger(__name__)

# Base URL for the Next.js API (adjust if needed)
API_BASE_URL = os.getenv("FRONTEND_API_URL", "http://localhost:3000/api")


def _emit_event(event_type: str, from_agent: str, to_agent: Optional[str] = None, data: Optional[Dict] = None, color: str = "#00aaff"):
    """Helper to emit events to the frontend visualization."""
    try:
        event = {
            "id": f"event-{int(time.time() * 1000)}",
            "timestamp": int(time.time() * 1000),
            "type": event_type,
            "from": from_agent,
            "to": to_agent,
            "data": data,
            "color": color,
        }
        
        # Try to broadcast via API (non-blocking)
        try:
            httpx.post(f"{API_BASE_URL}/events/broadcast", json=event, timeout=0.1)
        except:
            pass  # Fail silently if frontend not available
    except Exception as e:
        log.debug(f"Event emission failed (non-critical): {e}")


async def read_alert_data(
    alert_id: Optional[str] = None,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Read AMBER Alert data from JSON file.
    
    Args:
        alert_id: Optional alert ID to filter (default: reads first alert from file).
    
    Returns:
        Alert data dictionary.
    """
    log_id = "[AmberTools:read_alert_data]"
    log.debug(f"{log_id} Reading alert data")
    
    try:
        data_dir = tool_config.get("data_dir", "data") if tool_config else "data"
        alert_path = os.path.join(data_dir, "amber_alert.json")
        
        with open(alert_path, "r") as f:
            alert_data = json.load(f)
        
        if alert_id and alert_data.get("alert_id") != alert_id:
            return {"status": "error", "message": f"Alert {alert_id} not found"}
        
        log.info(f"{log_id} Successfully read alert {alert_data.get('alert_id')}")
        return {"status": "success", "data": alert_data}
    
    except FileNotFoundError:
        log.error(f"{log_id} Alert file not found", exc_info=True)
        return {"status": "error", "message": "Alert data file not found"}
    except Exception as e:
        log.error(f"{log_id} Error reading alert: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


async def assess_alert_urgency(
    alert_data: Dict[str, Any],
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    AI agent assesses alert urgency and priority.
    
    Args:
        alert_data: Alert data dictionary.
    
    Returns:
        Assessment with priority level and reasoning.
    """
    log_id = "[AmberTools:assess_alert_urgency]"
    log.debug(f"{log_id} Assessing alert urgency")
    
    try:
        # Simple heuristic-based assessment (in real system, LLM would do this)
        urgency = alert_data.get("incident_details", {}).get("urgency", "UNKNOWN")
        priority = "HIGH" if "HIGH" in urgency.upper() or "CRITICAL" in urgency.upper() else "MEDIUM"
        
        assessment = {
            "priority": priority,
            "urgency": urgency,
            "reasoning": f"Alert classified as {priority} based on: {urgency}",
            "recommended_actions": ["broadcast_immediately", "activate_cameras", "notify_authorities"],
        }
        
        _emit_event("alert_assessed", "AI Analyzer", "Broadcast Agent", assessment, "#ffa500")
        
        log.info(f"{log_id} Assessment complete: {priority}")
        return {"status": "success", "assessment": assessment}
    
    except Exception as e:
        log.error(f"{log_id} Assessment failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


async def read_tips(
    alert_id: Optional[str] = None,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Read tips from JSON file.
    
    Args:
        alert_id: Optional alert ID to filter tips.
    
    Returns:
        Tips data dictionary.
    """
    log_id = "[AmberTools:read_tips]"
    log.debug(f"{log_id} Reading tips")
    
    try:
        data_dir = tool_config.get("data_dir", "data") if tool_config else "data"
        tips_path = os.path.join(data_dir, "tips.json")
        
        with open(tips_path, "r") as f:
            tips_data = json.load(f)
        
        # Filter by alert_id if provided
        if alert_id:
            tips_data["tips"] = [t for t in tips_data.get("tips", []) if t.get("alert_id") == alert_id]
        
        log.info(f"{log_id} Read {len(tips_data.get('tips', []))} tips")
        return {"status": "success", "data": tips_data}
    
    except FileNotFoundError:
        log.error(f"{log_id} Tips file not found", exc_info=True)
        return {"status": "error", "message": "Tips data file not found"}
    except Exception as e:
        log.error(f"{log_id} Error reading tips: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


async def process_tip(
    tip_data: Dict[str, Any],
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Process and verify a tip, calculating confidence score.
    
    Args:
        tip_data: Tip data dictionary.
    
    Returns:
        Processed tip with confidence score.
    """
    log_id = f"[AmberTools:process_tip:{tip_data.get('id', 'unknown')}]"
    log.debug(f"{log_id} Processing tip")
    
    try:
        # Calculate confidence based on tip details
        confidence = 0.5  # Base confidence
        
        if tip_data.get("sighting", {}).get("child_seen"):
            confidence += 0.3
        if tip_data.get("sighting", {}).get("vehicle_match"):
            confidence += 0.2
        if tip_data.get("caller_details", {}).get("reliability") and "verified" in tip_data["caller_details"]["reliability"].lower():
            confidence += 0.2
        
        confidence = min(confidence, 1.0)
        confidence_pct = int(confidence * 100)
        
        processed = {
            **tip_data,
            "ai_confidence": confidence_pct,
            "ai_reasoning": f"Confidence: {confidence_pct}% based on child sighting, vehicle match, and caller reliability",
            "verification_status": "high" if confidence > 0.7 else "medium" if confidence > 0.5 else "low",
        }
        
        _emit_event("tip_processed", "Tip Processor", "AI Analyzer", {
            "tip_id": tip_data.get("id"),
            "confidence": confidence_pct,
        }, "#00ff00")
        
        log.info(f"{log_id} Tip processed with {confidence_pct}% confidence")
        return {"status": "success", "processed_tip": processed}
    
    except Exception as e:
        log.error(f"{log_id} Tip processing failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


async def create_geofence(
    last_known_location: Dict[str, Any],
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Create geofence zones based on last known location.
    
    Args:
        last_known_location: Location data with coords.
    
    Returns:
        Geofence zones for camera scanning.
    """
    log_id = "[AmberTools:create_geofence]"
    log.debug(f"{log_id} Creating geofence")
    
    try:
        coords = last_known_location.get("coords", {})
        lat = coords.get("lat", 0)
        lon = coords.get("lon", 0)
        
        # Create zones around last known location
        zones = [
            {"name": "north_corridor", "radius_km": 20, "priority": "high"},
            {"name": "highway_5", "radius_km": 15, "priority": "high"},
            {"name": "rest_stops", "radius_km": 30, "priority": "medium"},
        ]
        
        geofence = {
            "center": {"lat": lat, "lon": lon},
            "zones": zones,
            "created_at": datetime.utcnow().isoformat(),
        }
        
        _emit_event("geofence_created", "Geo Intelligence", "Camera Agent", geofence, "#00aaff")
        
        log.info(f"{log_id} Created {len(zones)} geofence zones")
        return {"status": "success", "geofence": geofence}
    
    except Exception as e:
        log.error(f"{log_id} Geofence creation failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}


async def simulate_camera_scan(
    geofence_data: Dict[str, Any],
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Simulate camera scanning in geofence zones.
    
    Args:
        geofence_data: Geofence zones to scan.
    
    Returns:
        Scan results with potential detections.
    """
    log_id = "[AmberTools:simulate_camera_scan]"
    log.debug(f"{log_id} Simulating camera scan")
    
    try:
        zones = geofence_data.get("zones", [])
        cameras_active = len(zones) * 4  # 4 cameras per zone
        
        # Simulate detection (random for demo)
        import random
        detected = random.random() > 0.7  # 30% chance of detection
        
        result = {
            "zones_scanned": len(zones),
            "cameras_active": cameras_active,
            "detection": detected,
            "status": "scanning_complete",
        }
        
        if detected:
            result["detection_details"] = {
                "zone": zones[0]["name"],
                "confidence": 85,
                "timestamp": datetime.utcnow().isoformat(),
            }
            _emit_event("suspect_detected", "Camera Agent", "Tip Processor", result, "#00ff00")
        else:
            _emit_event("camera_scan_complete", "Camera Agent", None, result, "#888")
        
        log.info(f"{log_id} Scan complete: {'detected' if detected else 'no detection'}")
        return {"status": "success", "scan_result": result}
    
    except Exception as e:
        log.error(f"{log_id} Camera scan failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}
