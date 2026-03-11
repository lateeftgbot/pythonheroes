from flask import request, jsonify
from functools import wraps
import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

def ensure_connection():
    """Ensure MongoDB connection is active and variables are initialized"""
    # Import extensions module to access its variables
    from . import extensions
    
    # Load environment variables
    load_dotenv()
    
    # Check if existing connection is alive
    if extensions.client and extensions.db is not None and extensions.users_collection is not None:
        try:
            extensions.client.admin.command('ping')
            return True
        except:
            pass
            
    # Reset
    extensions.client = None
    extensions.db = None
    extensions.users_collection = None
    extensions.learning_materials_collection = None
    extensions.projects_collection = None
    extensions.problem_sets_collection = None
    extensions.ai_cache_collection = None

    # We need access to config, but utils shouldn't import app directly to avoid circularity
    # For now, get from environment
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("ERROR: MONGO_URI not found in environment")
        return False
        
    try:
        # Reduced timeout to fail faster if network is blocked
        extensions.client = MongoClient(
            uri, 
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        extensions.client.admin.command('ping')
        extensions.db = extensions.client.get_database('vectors_db')
        extensions.users_collection = extensions.db.users
        extensions.learning_materials_collection = extensions.db.learning_materials
        extensions.projects_collection = extensions.db.projects
        extensions.problem_sets_collection = extensions.db.problem_sets
        extensions.ai_cache_collection = extensions.db.ai_cache
        print("MongoDB connection established successfully")
        return True
    except Exception as e:
        print(f"Connection failed in utils: {e}")
        return False

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_email = request.headers.get('X-Admin-Email') or request.args.get('admin_email')
        if not admin_email:
            return jsonify({"error": "Unauthorized: Admin email required"}), 403
            
        # Hardcoded owner always has access
        if admin_email == "lateefolayinka97@gmail.com":
            return f(*args, **kwargs)
            
        # Check database for admin role
        if not ensure_connection():
            return jsonify({"error": "Database connection failed"}), 500
            
        from . import extensions
        user = extensions.users_collection.find_one({"email": admin_email})
        if user and user.get('role') in ['admin', 'master1_vectors']:
            return f(*args, **kwargs)
            
        return jsonify({"error": "Unauthorized: Admin access required"}), 403
    return decorated_function

def get_next_sequence(sequence_name):
    """Get next sequence number for user IDs"""
    from . import extensions
    
    if extensions.db is None:
        return None
    
    counters = extensions.db.counters
    counter = counters.find_one({"_id": sequence_name})
    if not counter:
        counters.insert_one({"_id": sequence_name, "seq": 123456788})
    
    result = counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"seq": 1}},
        return_document=True
    )
    return f"{result['seq']:010d}"

def check_online_status(last_seen_str):
    """Calculate if a user is online based on 5-minute threshold"""
    if not last_seen_str:
        return False
    try:
        import datetime
        from datetime import timezone
        
        if isinstance(last_seen_str, datetime.datetime):
            last_seen = last_seen_str
        else:
            clean_str = str(last_seen_str).replace('Z', '+00:00')
            if '.' in clean_str:
                parts = clean_str.split('.')
                clean_str = parts[0] + ('+' + parts[1].split('+')[1] if '+' in parts[1] else '')
            last_seen = datetime.datetime.fromisoformat(clean_str)
        
        if last_seen.tzinfo is not None:
            now = datetime.datetime.now(timezone.utc).replace(tzinfo=None)
            last_seen = last_seen.replace(tzinfo=None)
        else:
            now = datetime.datetime.utcnow()
            
        return (now - last_seen).total_seconds() < 300
    except Exception as e:
        print(f"DEBUG: Online status check failed: {e}")
        return False

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
