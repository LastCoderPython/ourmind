import os
import base64
import jwt
from jwt.algorithms import HMACAlgorithm
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# ── Load the Supabase JWT secret ────────────────────────────────────────────
# Supabase Dashboard (Settings > API) shows a Base64-encoded JWT secret.
# Supabase signs user JWTs (HS256) using the **decoded bytes** of that string.
# We must base64-decode it, then use HMACAlgorithm.prepare_key() so PyJWT
# doesn't misidentify the raw bytes as an asymmetric key.
_raw_secret = os.environ.get("SUPABASE_JWT_SECRET", "")

_jwt_key = None  # Will hold the prepared HMAC key

if not _raw_secret:
    print("[Auth WARNING] SUPABASE_JWT_SECRET is not set!")
elif _raw_secret.count(".") == 2 and _raw_secret.startswith("eyJ"):
    print("[Auth CRITICAL] SUPABASE_JWT_SECRET looks like a JWT token, NOT the signing secret!")
    print("[Auth CRITICAL] Go to Supabase Dashboard > Settings > API > JWT Secret.")
else:
    try:
        # 1. Base64-decode the secret to get the raw HMAC key bytes
        secret_bytes = base64.b64decode(_raw_secret)
        # 2. Explicitly prepare it as an HMAC key so PyJWT won't auto-detect
        hmac_algo = HMACAlgorithm(HMACAlgorithm.SHA256)
        _jwt_key = hmac_algo.prepare_key(secret_bytes)
        print(f"[Auth] JWT Secret loaded OK (decoded {len(secret_bytes)} bytes, prepared HMAC key)")
    except Exception as e:
        print(f"[Auth WARNING] Could not base64-decode secret ({e}), trying raw string...")
        try:
            hmac_algo = HMACAlgorithm(HMACAlgorithm.SHA256)
            _jwt_key = hmac_algo.prepare_key(_raw_secret)
            print(f"[Auth] JWT Secret loaded as raw string ({len(_raw_secret)} chars, prepared HMAC key)")
        except Exception as e2:
            print(f"[Auth ERROR] Could not prepare JWT key: {e2}")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Supabase JWT token from the Authorization header
    and returns the authenticated user's ID.

    Supabase signs all user JWTs with HS256.
    """
    token = credentials.credentials

    if _jwt_key is None:
        print("[Auth ERROR] No valid JWT secret configured. Cannot verify tokens.")
        raise HTTPException(status_code=401, detail="Server authentication is misconfigured")

    try:
        payload = jwt.decode(
            token,
            _jwt_key,
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
        try:
            header = jwt.get_unverified_header(token)
            print(f"[Auth ERROR] Signature mismatch. Header: alg={header.get('alg')}, typ={header.get('typ')}")
        except Exception:
            print("[Auth ERROR] Signature mismatch.")
        raise HTTPException(status_code=401, detail="Invalid authentication token signature")

    except jwt.InvalidTokenError as e:
        print(f"[Auth ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    except Exception as e:
        print(f"[Auth ERROR] Unexpected: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {e}")
