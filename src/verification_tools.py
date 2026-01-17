import logging
import json
from typing import Any, Dict, Optional

log = logging.getLogger(__name__)

async def verify_tip(
    tip_id: str,
    tool_context: Optional[Any] = None,
    tool_config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Load and verify a tip against the alert data.
    
    This tool loads both the tip and alert data, then returns them
    to the AI agent for analysis and confidence scoring.
    
    Args:
        tip_id: ID of the tip to verify (e.g., "TIP-001")
        tool_context: SAM framework context
        tool_config: Configuration with file paths
    
    Returns:
        Dict with tip data, alert data, and status
    """
    log_id = f"[TipVerify:verify_tip:{tip_id}]"
    log.debug(f"{log_id} Starting verification")
    
    try:
        # Load file paths from config
        alert_file = tool_config.get("alert_file") if tool_config else "data/amber_alert.json"
        tips_file = tool_config.get("tips_file") if tool_config else "data/tips.json"
        
        # Load alert data
        with open(alert_file, 'r') as f:
            alert = json.load(f)
        
        # Load tips data
        with open(tips_file, 'r') as f:
            tips_data = json.load(f)
        
        # Find the specific tip
        tip = next((t for t in tips_data["tips"] if t["id"] == tip_id), None)
        
        if not tip:
            log.error(f"{log_id} Tip not found")
            return {
                "status": "error",
                "message": f"Tip {tip_id} not found in data file"
            }
        
        log.info(f"{log_id} Successfully loaded tip and alert data")
        
        # Return data for AI agent to analyze
        return {
            "status": "success",
            "tip": tip,
            "alert": alert,
            "message": f"Loaded tip {tip_id} for AI verification. Analyze the tip against the alert details and provide a confidence score."
        }
        
    except FileNotFoundError as e:
        log.error(f"{log_id} File not found: {e}")
        return {
            "status": "error",
            "message": f"Data file not found: {e}"
        }
    except json.JSONDecodeError as e:
        log.error(f"{log_id} Invalid JSON: {e}")
        return {
            "status": "error",
            "message": f"Invalid JSON in data file: {e}"
        }
    except Exception as e:
        log.error(f"{log_id} Unexpected error: {e}", exc_info=True)
        return {
            "status": "error",
            "message": f"Verification failed: {str(e)}"
        }