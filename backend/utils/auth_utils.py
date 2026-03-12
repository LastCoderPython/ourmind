import os
import jwt
import requests
from jwt.algorithms import ECAlgorithm
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# ── Load the Supabase JWKS (ES256 public key) ──────────────────────────────
# Supabase signs user JWTs using ES256 (ECDSA P-256), NOT HS256.
# We fetch the public key from the JWKS endpoint at startup.
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
_jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else ""

_public_keys: dict = {}  # Maps kid -> public key object


def _load_jwks():
    """Fetch JWKS from Supabase and build a kid -> public_key mapping."""
    global _public_keys
    if not _jwks_url:
        print("[Auth WARNING] SUPABASE_URL not set, cannot fetch JWKS")
        return

    try:
        print(f"[Auth] Fetching JWKS from {_jwks_url}")
        resp = requests.get(_jwks_url, timeout=10)
        resp.raise_for_status()
        jwks = resp.json()

        for key_data in jwks.get("keys", []):
            kid = key_data.get("kid")
            alg = key_data.get("alg", "ES256")
            if key_data.get("kty") == "EC":
                # Convert JWK to PEM public key using PyJWT's ECAlgorithm
                public_key = ECAlgorithm.from_jwk(key_data)
                _public_keys[kid] = {"key": public_key, "alg": alg}
                print(f"[Auth] Loaded EC public key: kid={kid}, alg={alg}")

        if not _public_keys:
            print("[Auth WARNING] No EC keys found in JWKS response")
        else:
            print(f"[Auth] JWKS loaded OK: {len(_public_keys)} key(s)")

    except Exception as e:
        print(f"[Auth ERROR] Failed to fetch JWKS: {type(e).__name__}: {e}")


# Load keys at module import time (server startup)
_load_jwks()


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Supabase JWT token from the Authorization header
    and returns a tuple of (user_id, raw_jwt_payload).

    Supabase signs JWTs with ES256 (ECDSA P-256).
    """
    token = credentials.credentials

    if not _public_keys:
        # Try loading again in case startup failed (e.g. network issue)
        _load_jwks()
        if not _public_keys:
            print("[Auth ERROR] No public keys available. Cannot verify tokens.")
            raise HTTPException(status_code=401, detail="Server authentication is misconfigured")

    try:
        # Read the token header to find the right key
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        alg = unverified_header.get("alg", "ES256")

        key_info = _public_keys.get(kid)
        if not key_info:
            print(f"[Auth ERROR] Unknown key ID (kid={kid}). Available: {list(_public_keys.keys())}")
            raise HTTPException(status_code=401, detail="Invalid authentication token: unknown key")

        payload = jwt.decode(
            token,
            key_info["key"],
            algorithms=[key_info["alg"]],
            options={"verify_aud": False},
        )

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token missing user ID (sub)")

        print(f"[Auth OK] User {user_id[:8]}... authenticated via {alg}")
        return user_id, payload

    except jwt.ExpiredSignatureError:
        print("[Auth ERROR] Token has expired")
        raise HTTPException(status_code=401, detail="Authentication token has expired")

    except jwt.InvalidSignatureError:
        print("[Auth ERROR] Signature verification failed")
        raise HTTPException(status_code=401, detail="Invalid authentication token signature")

    except jwt.InvalidTokenError as e:
        print(f"[Auth ERROR] {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    except HTTPException:
        raise

    except Exception as e:
        print(f"[Auth ERROR] Unexpected: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {e}")
