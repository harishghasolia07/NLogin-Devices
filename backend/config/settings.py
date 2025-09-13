import os


# Database Configuration
MONGODB_URI = os.getenv(
    "MONGODB_URI", "mongodb://localhost:27017"
)

# Application Configuration
MAX_DEVICES = 2

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "https://n-device-login.vercel.app"  # Your actual Vercel domain
]

# Database Names
DB_NAME = "ndevice_login"
SESSIONS_COLLECTION = "sessions"
