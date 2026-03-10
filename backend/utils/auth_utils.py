import os
import base64
import jwt
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

# ── Load the Supabase JWT secret ────────────────────────────────────────────
# The JWT secret from Supabase Dashboard (Settings > API > JWT Secret).
# We keep it as a string — PyJWT handles str keys correctly for HMAC (HS256).
_raw_secret = os.environ.get("SUPABASE_JWT_SECRET", "")

if not _raw_secret:
    print("[Auth WARNING] SUPABASE_JWT_SECRET is not set!")
    _secrets_to_try: list[str] = []
elif _raw_secret.count(".") == 2 and _raw_secret.startswith("eyJ"):
    # Sanity check: looks like a JWT token, not a signing secret
    print("[Auth CRITICAL] SUPABASE_JWT_SECRET looks like a JWT token (anon or service_role key), NOT the JWT signing secret!")
    print("[Auth CRITICAL] Go to Supabase Dashboard > Settings > API > JWT Secret and copy the actual secret string.")
    _secrets_to_try = []
else:
    # Build a list of key representations to try:
    # 1. Raw string as-is (standard approach for Supabase + PyJWT)
    # 2. Base64-decoded bytes re-encoded as latin-1 string (in case the secret is base64-wrapped)
    _secrets_to_try = [_raw_secret]
    try:
        _decoded = base64.b64decode(_raw_secret).decode("latin-1")
        _secrets_to_try.append(_decoded)
    except Exception:
        pass
    print(f"[Auth] JWT Secret loaded (length={len(_raw_secret)}, variants to try={len(_secrets_to_try)})")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Validates the Supabase JWT token from the Authorization header
    and returns the authenticated user's ID.

    Supabase signs all user JWTs with HS256.
    """
    token = credentials.credentials

    if not _secrets_to_try:
        print("[Auth ERROR] No valid JWT secret configured. Cannot verify tokens.")
        raise HTTPException(status_code=401, detail="Server authentication is misconfigured")

    last_error = None

    for secret in _secrets_to_try:
        try:
            payload = jwt.decode(
                token,
                secret,
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

        except (jwt.InvalidSignatureError, jwt.InvalidAlgorithmError) as e:
            last_error = f"{type(e).__name__}: {e}"
            continue  # try next secret variant

        except jwt.InvalidTokenError as e:
            last_error = f"{type(e).__name__}: {e}"
            continue  # try next secret variant

    # All secret variants failed — log diagnostics
    try:
        header = jwt.get_unverified_header(token)
        print(f"[Auth ERROR] All secret variants failed. Token header: alg={header.get('alg')}, typ={header.get('typ')}. Last error: {last_error}")
    except Exception:
        print(f"[Auth ERROR] All secret variants failed. Last error: {last_error}")

    raise HTTPException(status_code=401, detail="Invalid authentication token")

