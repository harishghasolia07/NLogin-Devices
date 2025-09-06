from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone, timedelta
import uuid

from models.schemas import (
    LoginRequest, LoginResponse, LogoutRequest, ValidationResponse,
    ActiveSessionsResponse
)
from database.connection import sessions_collection
from utils.helpers import session_to_dict
from config.settings import MAX_DEVICES

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login_session(request: LoginRequest):
    """
    Attempt to create a new session for a user.
    Returns success if under device limit, otherwise returns active sessions.
    """
    try:
        # First, check if there's already an active session for this user + device combination
        existing_session = await sessions_collection.find_one({
            "userId": request.userId,
            "deviceId": request.deviceId,
            "active": True
        })
        
        if existing_session:
            # Update last seen time for existing session
            await sessions_collection.update_one(
                {"sessionId": existing_session["sessionId"]},
                {"$set": {"lastSeen": datetime.now(timezone.utc)}}
            )
            return LoginResponse(status="ok", sessionId=existing_session["sessionId"])
        
        # Use upsert to prevent race conditions - try to create session atomically
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        # First try to insert the session atomically - this will fail if one already exists
        session_doc = {
            "sessionId": session_id,
            "userId": request.userId,
            "deviceId": request.deviceId,
            "deviceInfo": request.deviceInfo,
            "createdAt": now,
            "lastSeen": now,
            "active": True
        }
        
        # Try to insert only if no active session exists for this user+device
        result = await sessions_collection.update_one(
            {
                "userId": request.userId,
                "deviceId": request.deviceId,
                "active": True
            },
            {
                "$setOnInsert": session_doc
            },
            upsert=True
        )
        
        if result.upserted_id:
            # New session was created
            
            # Check if we're still under device limit after creation
            active_sessions_count = await sessions_collection.count_documents({
                "userId": request.userId,
                "active": True
            })
            
            if active_sessions_count <= MAX_DEVICES:
                return LoginResponse(status="ok", sessionId=session_id)
            else:
                # We exceeded the limit, remove this session and return active sessions
                await sessions_collection.update_one(
                    {"sessionId": session_id},
                    {"$set": {"active": False}}
                )
                
                active_sessions_cursor = sessions_collection.find({
                    "userId": request.userId,
                    "active": True
                })
                active_sessions = await active_sessions_cursor.to_list(length=None)
                sessions_list = [session_to_dict(session) for session in active_sessions]
                return LoginResponse(
                    status="limit_reached",
                    activeSessions=sessions_list
                )
        else:
            # Session already exists (race condition), find and return it
            existing_session = await sessions_collection.find_one({
                "userId": request.userId,
                "deviceId": request.deviceId,
                "active": True
            })
            return LoginResponse(status="ok", sessionId=existing_session["sessionId"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/logout")
async def logout_session(request: LogoutRequest):
    """Mark a session as inactive"""
    try:
        result = await sessions_collection.update_one(
            {"sessionId": request.sessionId},
            {"$set": {"active": False}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
            
        return {"status": "logged_out"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(e)}")


@router.post("/force-logout")
async def force_logout_session(request: LogoutRequest):
    """Force logout a session (used when device limit is reached)"""
    try:
        result = await sessions_collection.update_one(
            {"sessionId": request.sessionId},
            {"$set": {"active": False}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Session not found")
            
        return {"status": "logged_out"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Force logout failed: {str(e)}")


@router.get("/validate", response_model=ValidationResponse)
async def validate_session(sessionId: str):
    """Validate if a session is still active"""
    try:
        session = await sessions_collection.find_one({"sessionId": sessionId})
        
        if not session:
            return ValidationResponse(valid=False, reason="session_not_found")
            
        if not session.get("active", False):
            return ValidationResponse(valid=False, reason="logged_out")
        
        # Update last seen timestamp
        await sessions_collection.update_one(
            {"sessionId": sessionId},
            {"$set": {"lastSeen": datetime.now(timezone.utc)}}
        )
        
        return ValidationResponse(valid=True)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


@router.get("/active", response_model=ActiveSessionsResponse)
async def get_active_sessions(userId: str):
    """Get all active sessions for a user"""
    try:
        active_sessions_cursor = sessions_collection.find({
            "userId": userId,
            "active": True
        }).sort("lastSeen", -1)  # Sort by last seen, most recent first
        
        active_sessions = await active_sessions_cursor.to_list(length=None)
        sessions_list = [session_to_dict(session) for session in active_sessions]
        
        return ActiveSessionsResponse(sessions=sessions_list)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sessions: {str(e)}")
