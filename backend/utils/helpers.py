from datetime import datetime


def session_to_dict(session_doc):
    """Convert MongoDB document to dictionary with proper serialization"""
    if session_doc:
        session_doc['_id'] = str(session_doc['_id'])
        # Convert datetime objects to ISO strings
        if 'createdAt' in session_doc:
            session_doc['createdAt'] = session_doc['createdAt'].isoformat()
        if 'lastSeen' in session_doc:
            session_doc['lastSeen'] = session_doc['lastSeen'].isoformat()
        return session_doc
    return None
