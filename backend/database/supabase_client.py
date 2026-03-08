import os
from supabase import create_client, Client

# These variables must be populated in the .env file
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# Initialize the global Supabase client
supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[Database] [OK] Supabase client initialized.")
    except Exception as e:
        print(f"[Database] ERROR initializing Supabase client: {e}")
else:
    print("[Database] WARNING: SUPABASE_URL or SUPABASE_KEY is missing. Database operations will fail.")

def get_db_client() -> Client:
    """Helper to retrieve the database client."""
    if supabase is None:
        raise RuntimeError("Supabase client is not initialized. Please check your .env credentials.")
    return supabase
