import os
import base64
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# ── Load and decode the Supabase JWT secret ─────────────────────────────────
# The JWT secret from Supabase Dashboard (Settings > API > JWT Secret)
# is a Base64-encoded string. We must decode it to get the raw HMAC key.
_raw_secret = os.environ.get("SUPABASE_JWT_SECRET", "")

if not _raw_secret:
    print("[Auth WARNING] SUPABASE_JWT_SECRET is not set!")
    JWT_SECRET_KEY: bytes = b""
else:
    # Sanity check: if the secret looks like a JWT token (3 dot-separated parts),
    # the user likely pasted the anon/service_role key instead of the JWT secret.
    if _raw_secret.count(".") == 2 and _raw_secret.startswith("eyJ"):
        print("[Auth CRITICAL] SUPABASE_JWT_SECRET looks like a JWT token (anon or service_role key), NOT the JWT signing secret!")
        print("[Auth CRITICAL] Go to Supabase Dashboard > Settings > API > JWT Secret and copy the actual secret string.")
        JWT_SECRET_KEY = b""
    else:
        try:
            # The Supabase JWT secret is Base64-encoded; decode it to raw bytes.
            JWT_SECRET_KEY = base64.b64decode(_raw_secret)
            print(f"[Auth] JWT Secret loaded and base64-decoded OK (raw key length={len(JWT_SECRET_KEY)} bytes)")
        except Exception:
            # If base64 decoding fails, use the raw string as-is (UTF-8 bytes).
            JWT_SECRET_KEY = _raw_secret.encode("utf-8")
            print(f"[Auth] JWT Secret loaded as raw string (length={len(JWT_SECRET_KEY)} bytes)")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Supabase JWT token from the Authorization header
    and returns the authenticated user's ID.

    Supabase signs all user JWTs with HS256.
    """
    token = credentials.credentials

    if not JWT_SECRET_KEY:
        print("[Auth ERROR] No valid JWT secret configured. Cannot verify tokens.")
        raise HTTPException(status_code=401, detail="Server authentication is misconfigured")

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token: missing user ID (sub)",
            )

        print(f"[Auth OK] User {user_id[:8]}... authenticated")
        return user_id

    except jwt.ExpiredSignatureError:
        print("[Auth ERROR] Token has expired")
        raise HTTPException(status_code=401, detail="Authentication token has expired")

    except jwt.InvalidSignatureError:
        # Log diagnostic info to help with further debugging
        try:
            header = jwt.get_unverified_header(token)
            print(f"[Auth ERROR] Signature mismatch. Token header: alg={header.get('alg')}, typ={header.get('typ')}")
        except Exception:
            print("[Auth ERROR] Signature mismatch. Could not read token header.")
        raise HTTPException(status_code=401, detail="Invalid authentication token signature")

    except jwt.InvalidTokenError as e:
        print(f"[Auth ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    except Exception as e:
        print(f"[Auth ERROR] Unexpected: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {e}")
