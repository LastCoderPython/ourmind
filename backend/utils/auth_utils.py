import os
import jwt
from fastapi import HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# IMPORTANT: The JWT secret from your Supabase project settings.
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "super-secret-jwt-token-with-at-least-32-characters-long")
print(f"[Auth] JWT Secret loaded (len={len(SUPABASE_JWT_SECRET)})")

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Supabase JWT token from the Authorization header 
    and returns the authenticated user's ID.
    """
    token = credentials.credentials
    
    # Try decoding with multiple algorithm options
    algorithms_to_try = [["HS256"], ["HS384"], ["HS512"]]
    last_error = None
    
    for algos in algorithms_to_try:
        try:
            payload = jwt.decode(
                token, 
                SUPABASE_JWT_SECRET, 
                algorithms=algos, 
                options={"verify_aud": False}
            )
            user_id = payload.get("sub")
            
            if user_id is None:
                raise HTTPException(status_code=401, detail="Invalid authentication token: missing user ID (sub)")
            
            print(f"[Auth OK] User {user_id[:8]}... authenticated via {algos[0]}")
            return user_id
            
        except jwt.InvalidAlgorithmError:
            last_error = f"Algorithm {algos[0]} not valid"
            continue
        except jwt.ExpiredSignatureError:
            print(f"[Auth ERROR] Token EXPIRED")
            raise HTTPException(status_code=401, detail="Authentication token has expired")
        except jwt.InvalidSignatureError:
            last_error = f"Signature invalid with {algos[0]}"
            continue
        except jwt.InvalidTokenError as e:
            last_error = f"{type(e).__name__}: {str(e)}"
            continue
        except Exception as e:
            print(f"[Auth ERROR] Unexpected: {type(e).__name__}: {str(e)}")
            raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
    
    # If all algorithms failed, log and raise
    # Also try to peek at the token header to help debug
    try:
        header = jwt.get_unverified_header(token)
        print(f"[Auth ERROR] All algorithms failed. Token header: alg={header.get('alg')}, typ={header.get('typ')}. Last error: {last_error}")
    except Exception:
        print(f"[Auth ERROR] All algorithms failed. Could not read token header. Last error: {last_error}")
    
    raise HTTPException(status_code=401, detail="Invalid authentication token")
