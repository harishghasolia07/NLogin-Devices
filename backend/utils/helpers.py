from datetime import datetime


def session_to_dict(session_doc):
    """Convert MongoDB document to dictionary with proper serialization"""
    if session_doc:
        session_doc['_id'] = str(session_doc['_id'])
        # Convert datetime objects to ISO strings with timezone info
        if 'createdAt' in session_doc:
            # Ensure timezone info is included for proper UTC handling
            if session_doc['createdAt'].tzinfo is None:
                # If no timezone info, assume it's UTC
                session_doc['createdAt'] = session_doc['createdAt'].replace(tzinfo=None).isoformat() + 'Z'
            else:
                session_doc['createdAt'] = session_doc['createdAt'].isoformat()
        if 'lastSeen' in session_doc:
            # Ensure timezone info is included for proper UTC handling
            if session_doc['lastSeen'].tzinfo is None:
                # If no timezone info, assume it's UTC
                session_doc['lastSeen'] = session_doc['lastSeen'].replace(tzinfo=None).isoformat() + 'Z'
            else:
                session_doc['lastSeen'] = session_doc['lastSeen'].isoformat()
        return session_doc
    return None
