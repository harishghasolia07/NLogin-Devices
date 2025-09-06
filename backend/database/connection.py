import motor.motor_asyncio
from config.settings import MONGODB_URI, DB_NAME, SESSIONS_COLLECTION


# MongoDB client and database setup
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]
sessions_collection = db[SESSIONS_COLLECTION]


async def setup_database():
    """Setup database indexes on startup"""
    try:
        # Create unique compound index on userId + deviceId + active
        # This prevents multiple active sessions for the same user+device
        await sessions_collection.create_index([
            ("userId", 1),
            ("deviceId", 1),
            ("active", 1)
        ], unique=True, partialFilterExpression={"active": True})
    except Exception as e:
        # Index creation might fail if it already exists
        pass


async def get_database():
    """Get database instance"""
    return db


async def get_sessions_collection():
    """Get sessions collection instance"""
    return sessions_collection
