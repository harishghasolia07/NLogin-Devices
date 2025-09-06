📌 Implementation Plan — N-Device Login App
1. Requirements
Tech Stack:

Frontend: Next.js + TailwindCSS + shadcn/ui

Backend: FastAPI

Authentication: Auth0

Database: MongoDB Atlas (free tier)

Core Features:

N-device login restriction:

A user can log in on at most N devices concurrently (e.g., N=3).

If the user logs in on N+1-th device, they should be prompted:

Cancel login

Or force logout one of the existing sessions.

Graceful logout:

If a device is logged out due to another device login, it should be redirected to the login page with a message:

“You were logged out because your account was signed in on another device.”

Private page:

Displays user’s full name and phone number (from Auth0 profile metadata).

Professional UI:

Modern polished frontend with protected routes, session manager, and clean dashboard.

2. Architecture
[Next.js Frontend] <--> [FastAPI Backend] <--> [MongoDB Atlas]
          |                         |
        [Auth0 SDK] ----------- [Auth0 API]
3. Database Schema (MongoDB sessions collection)
{
  "sessionId": "uuid",           // Unique session identifier
  "userId": "auth0|abc123",      // Auth0 user ID
  "deviceId": "uuid-per-device", // Unique ID per browser/device
  "createdAt": "2025-08-31T12:00:00Z",
  "lastSeen": "2025-08-31T12:10:00Z",
  "active": true
}
4. Backend (FastAPI)
Endpoints
POST /sessions/login

Input: userId, deviceId

Logic:

Count active sessions for user.

If < N: create new session, return { status: "ok", sessionId }.

If >= N: return { status: "limit_reached", activeSessions: [...] }.

POST /sessions/logout

Input: sessionId

Marks session as inactive (active=false).

GET /sessions/validate

Input: sessionId

Returns { valid: true } if active, else { valid: false, reason: "logged_out" }.

GET /sessions/active

Input: userId

Returns list of active sessions for session management page.

5. Frontend (Next.js)
Pages
/login: Auth0 login page.

/dashboard: Protected route showing full name + phone number.

/sessions: Session manager (list devices + force logout).

Flow
Login Flow

User logs in with Auth0.

Generate/store deviceId (UUID in localStorage).

Call backend POST /sessions/login.

If status=ok: save sessionId in cookie.

If status=limit_reached: show prompt with list of active devices → allow cancel or force logout.

Force Logout

User selects device to logout → call POST /sessions/logout.

Retry login → backend issues new sessionId.

Session Validation

On every page load, frontend calls GET /sessions/validate.

If session invalid → redirect to /login with graceful logout message.

Logout

On manual logout → call POST /sessions/logout → clear cookies → redirect /login.

6. Deployment
Frontend (Next.js) → Vercel (free)

Backend (FastAPI) → Render / Railway / Fly.io (free tier)

Database → MongoDB Atlas (free tier)

Auth → Auth0 free tenant

7. End-to-End Example
User logs in on Chrome → allowed ✅.

Logs in on Edge → allowed ✅.

Logs in on Mobile Safari → allowed ✅.

Logs in on Firefox → blocked ❌ → prompt: Cancel or Force logout one.

If force logout Chrome → Chrome session set inactive.

When Chrome user refreshes → redirected to login with graceful logout message.

Firefox now active ✅.
