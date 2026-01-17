import logging
from typing import Any, Dict, Optional
import math

log = logging.getLogger(__name__)

async def calculate_hot_zones(
    last_known_lat: float,
    last_known_lon: float,
    time_elapsed_minutes: int,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Calculate probable search zones based on time and location."""
    log_id = f"[GeoIntel:calculate_hot_zones]"
    log.debug(f"{log_id} Starting for ({last_known_lat}, {last_known_lon})")
    
    try:
        # Assume average speed of 60 km/h
        max_distance_km = (60 * time_elapsed_minutes) / 60
        
        # Generate 3 zones in different directions
        zones = []
        directions = [
            {"name": "North", "lat_offset": 1.0, "lon_offset": 0.0},
            {"name": "East", "lat_offset": 0.0, "lon_offset": 1.0},
            {"name": "Northeast", "lat_offset": 0.7, "lon_offset": 0.7}
        ]
        
        for i, direction in enumerate(directions):
            # Calculate zone center (simplified - 0.009 degrees lat ≈ 1 km)
            center_lat = last_known_lat + (direction["lat_offset"] * max_distance_km * 0.009)
            center_lon = last_known_lon + (direction["lon_offset"] * max_distance_km * 0.012)
            
            zones.append({
                "zone_id": f"ZONE-{i+1}",
                "name": f"{direction['name']} Corridor",
                "center": {"lat": round(center_lat, 4), "lon": round(center_lon, 4)},
                "radius_km": round(max_distance_km * 0.5, 1),
                "confidence": round(0.85 - (i * 0.15), 2)
            })
        
        log.info(f"{log_id} Generated {len(zones)} hot zones")
        
        return {
            "status": "success",
            "zones": zones,
            "max_distance_km": round(max_distance_km, 1),
            "message": f"Generated {len(zones)} probable search zones"
        }
    except Exception as e:
        log.error(f"{log_id} Failed: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}