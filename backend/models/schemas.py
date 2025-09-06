from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class LoginRequest(BaseModel):
    userId: str
    deviceId: str
    deviceInfo: Optional[str] = None


class LogoutRequest(BaseModel):
    sessionId: str


class Session(BaseModel):
    sessionId: str
    userId: str
    deviceId: str
    deviceInfo: Optional[str] = None
    createdAt: datetime
    lastSeen: datetime
    active: bool


class LoginResponse(BaseModel):
    status: str
    sessionId: Optional[str] = None
    activeSessions: Optional[List[dict]] = None


class ValidationResponse(BaseModel):
    valid: bool
    reason: Optional[str] = None


class ActiveSessionsResponse(BaseModel):
    sessions: List[dict]
