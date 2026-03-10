import os
import base64
import hmac
import hashlib
import json
import time
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# ── Load the Supabase JWT secret ────────────────────────────────────────────
_raw_secret = os.environ.get("SUPABASE_JWT_SECRET", "")

_hmac_key: bytes = b""

if not _raw_secret:
    print("[Auth WARNING] SUPABASE_JWT_SECRET is not set!")
elif _raw_secret.count(".") == 2 and _raw_secret.startswith("eyJ"):
    print("[Auth CRITICAL] SUPABASE_JWT_SECRET looks like a JWT token, NOT the signing secret!")
else:
    # Base64-decode the secret to get the raw HMAC key bytes.
    try:
        _hmac_key = base64.b64decode(_raw_secret)
        print(f"[Auth] JWT HMAC key loaded OK ({len(_hmac_key)} bytes from base64)")
    except Exception:
        _hmac_key = _raw_secret.encode("utf-8")
        print(f"[Auth] JWT HMAC key loaded as raw UTF-8 ({len(_hmac_key)} bytes)")


def _b64url_decode(data: str) -> bytes:
    """Base64url decode (JWT uses URL-safe base64 without padding)."""
    padding = 4 - len(data) % 4
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data)


def _verify_and_decode_jwt(token: str, secret: bytes) -> dict:
    """
    Manually verify an HS256 JWT and return its payload.
    Uses Python stdlib hmac/hashlib — no PyJWT key handling involved.
    """
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Malformed JWT: expected 3 parts")

    header_b64, payload_b64, signature_b64 = parts

    # 1. Verify the header says HS256
    header = json.loads(_b64url_decode(header_b64))
    alg = header.get("alg", "")
    if alg != "HS256":
        raise ValueError(f"Unsupported algorithm: {alg} (expected HS256)")

    # 2. Compute expected HMAC-SHA256 signature
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected_sig = hmac.new(secret, signing_input, hashlib.sha256).digest()

    # 3. Decode the actual signature from the token
    actual_sig = _b64url_decode(signature_b64)

    # 4. Constant-time comparison
    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError("Invalid signature")

    # 5. Decode and return payload
    payload = json.loads(_b64url_decode(payload_b64))

    # 6. Check expiration
    exp = payload.get("exp")
    if exp is not None and time.time() > exp:
        raise ValueError("Token has expired")

    return payload


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Supabase JWT token from the Authorization header
    and returns the authenticated user's ID.
    """
    token = credentials.credentials

    if not _hmac_key:
        print("[Auth ERROR] No valid JWT secret configured.")
        raise HTTPException(status_code=401, detail="Server authentication is misconfigured")

    try:
        payload = _verify_and_decode_jwt(token, _hmac_key)

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token missing user ID (sub)")

        print(f"[Auth OK] User {user_id[:8]}... authenticated")
        return user_id

    except ValueError as e:
        msg = str(e)
        print(f"[Auth ERROR] {msg}")
        if "expired" in msg.lower():
            raise HTTPException(status_code=401, detail="Authentication token has expired")
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {msg}")

    except Exception as e:
        print(f"[Auth ERROR] Unexpected: {type(e).__name__}: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
