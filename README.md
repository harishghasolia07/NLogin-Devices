# N-Device Login Manager

A sophisticated authentication system that restricts concurrent device logins using Auth0, FastAPI, and MongoDB. Users can be logged in on a maximum of N devices simultaneously (configurable, default: 2).

## 🚀 Features

- **N-Device Login Restriction**: Configurable concurrent device limits (currently set to 2)
- **Auth0 Integration**: Secure authentication with industry standards
- **Graceful Session Management**: Automatic logout handling with user notifications
- **Device Management UI**: Dedicated `/sessions` page to view and manage active sessions
- **Real-time Validation**: Session validation every 5 seconds
- **Beautiful UI**: Modern design with Tailwind CSS and shadcn/ui
- **MongoDB Atlas**: Scalable session storage with cloud database
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Enhanced User Info**: Displays full name, email, and phone number (when available)

## 🛠 Tech Stack

### Frontend
- **Next.js 13+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Auth0 Next.js SDK**
- **Lucide React** icons

### Backend
- **FastAPI** (Python)
- **MongoDB Atlas**
- **Motor** (Async MongoDB driver)
- **Pydantic** for data validation

### Authentication & Database
- **Auth0** (Free Tier)
- **MongoDB Atlas** (Free Tier)

## 📋 Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Auth0 account (free tier)
- MongoDB Atlas account (free tier)

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Environment Setup

Create `.env.local` in the root directory:

```env
AUTH0_SECRET='your-auth0-secret'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'

NEXT_PUBLIC_API_BASE_URL='http://localhost:8000'
MONGODB_URI='your-mongodb-atlas-connection-string'
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📱 How It Works

### Authentication Flow

1. **Login**: User signs in via Auth0
2. **Device Registration**: System generates unique device ID and detects device info
3. **Session Creation**: Backend creates session if under device limit (2 devices)
4. **Device Limit Check**: If limit reached, user chooses which device to logout
5. **Session Validation**: Each page validates current session every 5 seconds
6. **Graceful Logout**: Automatically redirects with clear message if logged out elsewhere

### Pages

- **`/`**: Landing page with authentication
- **`/dashboard`**: Main user dashboard with profile info and session overview
- **`/sessions`**: Dedicated session management page for device control

### Database Schema

```javascript
// MongoDB sessions collection
{
  "sessionId": "uuid",           // Unique session identifier
  "userId": "auth0|user_id",     // Auth0 user ID
  "deviceId": "device-uuid",     // Unique per device/browser
  "deviceInfo": "Chrome Browser", // Human-readable device info
  "createdAt": "2025-01-01T12:00:00Z",
  "lastSeen": "2025-01-01T12:10:00Z",
  "active": true
}
```

## 🎯 Key Features Explained

### Device Limit Management
- Configurable limit (currently: 2 devices)
- Smart device detection (mobile/desktop, browser type)
- Real-time session monitoring (5-second intervals)
- Manual device logout capabilities
- Dedicated session management page

### Security Features
- JWT token validation
- Secure session cookies
- Cross-origin request protection
- Session invalidation on logout

### User Experience
- Intuitive device limit modal
- Real-time session status
- Graceful error handling
- Beautiful, responsive UI

## 🔧 Configuration

### Adjust Device Limit

In `backend/config/settings.py`:
```python
MAX_DEVICES = 2  # Change to your desired limit
```

### Auth0 Setup

1. Create Auth0 application (Regular Web Application)
2. Configure callback URLs:
   - `http://localhost:3000/api/auth/callback`
   - `http://localhost:3000/api/auth/login`
3. Set logout URL: `http://localhost:3000`

## 📊 API Endpoints

### Session Management
- `POST /sessions/login` - Create new session
- `POST /sessions/logout` - End current session
- `POST /sessions/force-logout` - Force logout specific session
- `GET /sessions/validate` - Validate session status
- `GET /sessions/active` - Get user's active sessions

### Health Check
- `GET /` - API root endpoint
- `GET /health` - Health check

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Railway/Render)
```bash
cd backend
# Deploy to your preferred platform
```

### Environment Variables for Production
Update `.env.local` with production URLs and secure secrets.

## 🔍 Monitoring & Analytics

The system provides:
- Active session counts
- Device type analytics  
- User login patterns
- Session duration tracking

## 🛡 Security Considerations

- Sessions auto-expire after inactivity
- Device fingerprinting for security
- Secure cookie handling
- CORS protection
- Input validation and sanitization

## 📚 Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── sessions/          # Session management page
│   └── api/auth/          # Auth0 API routes
├── components/            # React components
│   ├── DeviceLimitModal.tsx
│   ├── SessionManager.tsx
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   ├── api.ts           # API client
│   ├── device.ts        # Device detection
│   └── session.ts       # Session management
├── backend/              # FastAPI backend
│   ├── main.py          # Main API application  
│   ├── models/          # Pydantic schemas
│   ├── routes/          # API route handlers
│   ├── config/          # Configuration
│   ├── database/        # Database connection
│   ├── utils/           # Helper functions
│   ├── requirements.txt # Python dependencies
│   └── run.py           # Development server
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

---

Built with ❤️ using Next.js, FastAPI, and Auth0