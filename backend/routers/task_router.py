import uuid
from datetime import date
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import get_current_user
from database.supabase_client import get_db_client

router = APIRouter(tags=["Gamification & Tasks"])

class TaskCreateRequest(BaseModel):
    tasks: list[str]

class TaskCompletionRequest(BaseModel):
    task_id: str
    completed: bool

@router.post("/api/tasks")
def create_tasks(request: TaskCreateRequest, user_id: str = Depends(get_current_user)):
    db = get_db_client()
    today = date.today().isoformat()
    
    inserts = []
    for desc in request.tasks:
        inserts.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "description": desc,
            "completed": False,
            "date": today
        })
        
    try:
        response = db.table("tasks").insert(inserts).execute()
        return {"status": "success", "tasks_created": len(inserts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/tasks/today")
def get_today_tasks(user_id: str = Depends(get_current_user)):
    db = get_db_client()
    today = date.today().isoformat()
    
    try:
        response = db.table("tasks").select("*").eq("user_id", user_id).eq("date", today).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/tasks/complete")
def update_task_status(request: TaskCompletionRequest, user_id: str = Depends(get_current_user)):
    db = get_db_client()
    try:
        # Update the task. Note: Supabase RLS should also ensure the user_id matches
        response = db.table("tasks").update({"completed": request.completed}).eq("id", request.task_id).eq("user_id", user_id).execute()
        return {"status": "success", "updated_task": request.task_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
