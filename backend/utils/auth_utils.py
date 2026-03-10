import os
import base64
import jwt
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# IMPORTANT: The JWT secret from your Supabase project settings. 
# Supabase provides it as a base64-encoded string — we must decode it.
_raw_secret = os.environ.get("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")

# Base64-decode if it looks base64-encoded (ends with = or has length divisible by 4)
try:
    SUPABASE_JWT_SECRET = base64.b64decode(_raw_secret)
    print(f"[Auth] JWT Secret loaded and base64-decoded (raw_len={len(_raw_secret)}, decoded_len={len(SUPABASE_JWT_SECRET)})")
except Exception:
    SUPABASE_JWT_SECRET = _raw_secret
    print(f"[Auth] JWT Secret loaded as plain string (len={len(SUPABASE_JWT_SECRET)})")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Supabase JWT token from the Authorization header 
    and returns the authenticated user's ID.
    """
    token = credentials.credentials
    try:
        # Supabase signs JWTs with HS256 algorithm and the project's JWT secret
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"], 
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication token: missing user ID (sub)")
        
        return user_id
        
    except jwt.ExpiredSignatureError:
        print(f"[Auth ERROR] Token EXPIRED")
        raise HTTPException(status_code=401, detail="Authentication token has expired")
    except jwt.InvalidSignatureError:
        print(f"[Auth ERROR] INVALID SIGNATURE – JWT secret mismatch!")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except jwt.InvalidTokenError as e:
        print(f"[Auth ERROR] InvalidTokenError: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        print(f"[Auth ERROR] Unexpected: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

