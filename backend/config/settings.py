import os


# Database Configuration
MONGODB_URI = os.getenv(
    "MONGODB_URI"
)

# Application Configuration
MAX_DEVICES = 2

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend-domain.com"
]

# Database Names
DB_NAME = "ndevice_login"
SESSIONS_COLLECTION = "sessions"
