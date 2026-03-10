import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from utils.auth_utils import get_current_user
from database.supabase_client import get_db_client

router = APIRouter(tags=["Community"])

class PostRequest(BaseModel):
    content: str
    username: str = "Anonymous"

class ReactRequest(BaseModel):
    post_id: str
    reaction_type: str # "support", "growth", "relatable", "strength"

@router.post("/api/posts")
def create_community_post(request: PostRequest, user_id: str = Depends(get_current_user)):
    db = get_db_client()
    
    post = {
        "id": str(uuid.uuid4()),
        "author_id": user_id, # Optional if true anonymity desired
        "username": request.username,
        "content": request.content
    }
    try:
        db.table("posts").insert(post).execute()
        return {"status": "success", "post_id": post["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/posts")
def get_recent_posts(user_id: str = Depends(get_current_user)):
    db = get_db_client()
    try:
        # Fetch latest 20 posts
        response = db.table("posts").select("*").order("created_at", desc=True).limit(20).execute()
        posts = response.data
        
        # In a real app, you would join reactions via SQL view or RPC for efficiency.
        # But here we'll just dynamically fetch reactions for all posts
        post_ids = [p["id"] for p in posts]
        if not post_ids:
            return []
            
        reactions_resp = db.table("reactions").select("*").in_("post_id", post_ids).execute()
        
        # Group reactions
        reaction_map = {pid: {"support": 0, "growth": 0, "relatable": 0, "strength": 0} for pid in post_ids}
        for r in reactions_resp.data:
            rtype = r["reaction_type"]
            if rtype in reaction_map[r["post_id"]]:
                reaction_map[r["post_id"]][rtype] += 1
                
        for post in posts:
            post["reactions"] = reaction_map[post["id"]]
            
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/react")
def react_to_post(request: ReactRequest, user_id: str = Depends(get_current_user)):
    db = get_db_client()
    
    reaction = {
        "id": str(uuid.uuid4()),
        "post_id": request.post_id,
        "user_id": user_id,
        "reaction_type": request.reaction_type
    }
    try:
        # Don't let users double-react the same type (would typically be an upsert or constraint)
        db.table("reactions").insert(reaction).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
