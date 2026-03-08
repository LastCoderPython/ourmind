from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import get_current_user
from database.supabase_client import get_db_client

router = APIRouter(tags=["Mind Garden"])

@router.get("/api/garden")
def get_garden(user_id: str = Depends(get_current_user)):
    db = get_db_client()
    try:
        response = db.table("gardens").select("*").eq("user_id", user_id).execute()
        if not response.data:
            # Create an initial garden entry
            garden = {"user_id": user_id, "plant_stage": 1, "water_level": 50, "sunlight_level": 50}
            db.table("gardens").insert(garden).execute()
            return garden
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/garden/water")
def water_plant(user_id: str = Depends(get_current_user)):
    """Simple gamification. E.g. called when a user completes 3 tasks."""
    db = get_db_client( )
    try:
        # Fetch current
        response = db.table("gardens").select("*").eq("user_id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Garden not found")
            
        garden = response.data[0]
        new_water = min(100, garden["water_level"] + 10)
        
        # Simple growth logic
        new_stage = garden["plant_stage"]
        if new_water >= 80 and garden["sunlight_level"] >= 80 and new_stage < 6:
            new_stage += 1
            new_water -= 50 # Consume resources to grow
            
        db.table("gardens").update({
            "water_level": new_water,
            "plant_stage": new_stage
        }).eq("user_id", user_id).execute()
        
        return {"status": "success", "new_stage": new_stage, "water_level": new_water}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
