# Manas AI Project: Handover & Context

This document captures the exact State of the Project as of **March 10, 2026** so you can pick up where you left off on another laptop.

## Current Status: Frontend-Backend Integration (Debugging)

### What is Working ✅
1. **Frontend (Next.js)**: fully built, multi-lingual (i18n), accessible, and beautiful.
2. **Backend (FastAPI)**: deployed and live on **Render** (`https://ourmind-931z.onrender.com`).
3. **Database (Supabase)**: schema is set up.
4. **Authentication Flow**:
    - Users can successfully "Create Account" using anonymous nicknames (`Nickname@manas.app`).
    - The frontend auto-redirects the user to the Dashboard after account creation.
    - Supabase "Confirm email" requirement has been **successfully disabled**.

### The Current Blocker ❌
While the frontend connects to the backend perfectly, **all API calls (Weather, Garden, Tasks, Chat) are returning `401 Unauthorized` errors**. 
- **The Issue**: The FastAPI backend (`auth_utils.py`) uses `PyJWT` to validate the Supabase JWT tokens attached in the `Authorization: Bearer <token>` header. 
- **The Error**: The tokens are being rejected. Initially, we discovered the Supabase JWT Secret was base64-encoded, which caused an `InvalidAlgorithmError`.
- **The Latest Attempt**: We just pushed a commit (`2f740f2`) that updates `auth_utils.py` to attempt decoding with multiple HMAC algorithms (`HS256`, `HS384`, `HS512`). If all fail, it will now explicitly **log the token header algorithm** to the Render console.

---

## Steps to Resume on Your New Laptop

**1. Clone the Repository & Pull Latest Changes**
Make sure to `git pull` on the `main` branch to get the latest `backend/utils/auth_utils.py` changes.

**2. Setup Frontend Environment**
Create a `.env.local` file inside the `frontend/` directory with these exact contents:
```env
NEXT_PUBLIC_SUPABASE_URL=https://jkshbhhixkleaqbssekv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imprc2hiaGhpeGtsZWFxYnNzZWt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5ODg4NDksImV4cCI6MjA4ODU2NDg0OX0.0RG_EaPJWspvMlD__z0Z7FIk8Zdb_4RpcvalDEsgmVc
NEXT_PUBLIC_API_BASE_URL=https://ourmind-931z.onrender.com
NEXT_PUBLIC_DEMO_MODE=false
```

**3. Setup Backend Environment (Optional for Local Testing)**
If you want to run the backend locally instead of relying on the Render deployment, create a `.env` file in the `backend/` directory with your Groq, HuggingFace, Cartesia, and Supabase credentials.

**4. Check Render Logs**
Go to your **Render Dashboard** for the `ourmind` service and check the logs. Play around the app in your new laptop (e.g., send a message in chat) and look at the Render logs. You should see an output like:
> `[Auth ERROR] All algorithms failed. Token header: alg=XXXX, typ=JWT`

**Provide that exact `alg=` value back to me.** This will tell us the exact algorithm Supabase is using to sign your tokens, so we can configure PyJWT perfectly in `auth_utils.py`.

---

## Key Files to Remember
- `frontend/contexts/AuthContext.tsx` - Dummy auth domain (`@manas.app`) logic
- `frontend/lib/apiClient.ts` - Axios interceptor attaching the JWT token
- `backend/utils/auth_utils.py` - JWT decoding script currently being debugged
- `backend/database/supabase_schema.sql` - Underlying DB structure
