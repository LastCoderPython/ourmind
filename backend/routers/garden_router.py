from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import get_current_user
from database.supabase_client import get_db_client

router = APIRouter(tags=["Mind Garden"])

@router.get("/api/garden")
def get_garden(user_auth: tuple[str, dict] = Depends(get_current_user)):
    user_id, _ = user_auth
    db = get_db_client()
    try:
        response = db.table("gardens").select("*").eq("user_id", user_id).execute()
        if not response.data:
            # Create an initial garden entry
            garden = {"user_id": user_id, "plant_stage": 1, "health_score": 100.0}
            db.table("gardens").insert(garden).execute()
            return garden
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/garden/water")
def water_plant(user_auth: tuple[str, dict] = Depends(get_current_user)):
    user_id, _ = user_auth
    """Simple gamification. E.g. called when a user completes 3 tasks."""
    db = get_db_client()
    try:
        # Fetch current
        response = db.table("gardens").select("*").eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Garden not found")
            
        garden = response.data[0]
        new_health = min(100.0, garden.get("health_score", 50.0) + 10.0)
        
        # Simple growth logic
        new_stage = garden["plant_stage"]
        if new_health >= 80 and new_stage < 6:
            new_stage += 1
            new_health -= 30  # Consume health to grow
            
        db.table("gardens").update({
            "health_score": new_health,
            "plant_stage": new_stage
        }).eq("user_id", user_id).execute()
        
        return {"status": "success", "new_stage": new_stage, "health_score": new_health}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

