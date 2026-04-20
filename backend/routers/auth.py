# backend/routers/auth.py
# FastAPI JWT auth — register, login, me
# Uses hashlib (built-in) instead of bcrypt — no version issues on Python 3.13
# Install: pip install python-jose[cryptography]

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

# ── Config ────────────────────────────────────────────────────────────────────
SECRET_KEY         = os.getenv("JWT_SECRET", "mutacure-super-secret-key-change-in-prod")
ALGORITHM          = "HS256"
TOKEN_EXPIRE_HOURS = 24

bearer = HTTPBearer(auto_error=False)

# ── Password hashing (sha256 + salt — simple, no bcrypt needed) ───────────────
def _hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}:{hashed}"

def _verify_password(password: str, stored: str) -> bool:
    try:
        salt, hashed = stored.split(":", 1)
        return hashlib.sha256(f"{salt}{password}".encode()).hexdigest() == hashed
    except Exception:
        return False

# ── In-memory user store (replace with DB in production) ──────────────────────
USERS: dict = {
    "doctor@mutacure.ai": {
        "name":     "Dr. Santos",
        "role":     "clinician",
        "password": _hash_password("doctor123"),
    },
    "patient@mutacure.ai": {
        "name":     "Alex Johnson",
        "role":     "patient",
        "password": _hash_password("patient123"),
    },
}

# ── Schemas ───────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str
    role:     str  # "clinician" or "patient"

class LoginRequest(BaseModel):
    email:    str
    password: str

class AuthResponse(BaseModel):
    token: str
    name:  str
    email: str
    role:  str

class UserOut(BaseModel):
    name:  str
    email: str
    role:  str

# ── JWT helpers ───────────────────────────────────────────────────────────────
def make_token(email: str, role: str, name: str) -> str:
    payload = {
        "sub":  email,
        "role": role,
        "name": name,
        "exp":  datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def get_current_user(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return decode_token(creds.credentials)

# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/register", response_model=AuthResponse)
def register(body: RegisterRequest):
    email = body.email.lower().strip()
    if email in USERS:
        raise HTTPException(status_code=400, detail="Email already registered")
    if body.role not in ("clinician", "patient"):
        raise HTTPException(status_code=400, detail="Role must be 'clinician' or 'patient'")
    USERS[email] = {
        "name":     body.name,
        "role":     body.role,
        "password": _hash_password(body.password),
    }
    token = make_token(email, body.role, body.name)
    return AuthResponse(token=token, name=body.name, email=email, role=body.role)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    email = body.email.lower().strip()
    user  = USERS.get(email)
    if not user or not _verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = make_token(email, user["role"], user["name"])
    return AuthResponse(token=token, name=user["name"], email=email, role=user["role"])


@router.get("/me", response_model=UserOut)
def me(current: dict = Depends(get_current_user)):
    return UserOut(name=current["name"], email=current["sub"], role=current["role"])


@router.post("/logout")
def logout():
    return {"message": "Logged out"}