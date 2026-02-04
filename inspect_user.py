
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import json
from datetime import datetime

# Custom JSON encoder for datetime
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

# Load environment
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(dotenv_path=env_path)

def inspect_user():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not set")
        return

    try:
        client = MongoClient(uri, tlsCAFile=certifi.where())
        db = client.get_default_database()
        users = db.users
        
        print("Searching for 'Henry'...")
        # Search widely to find potential matches
        query = {"name": {"$regex": "Henry", "$options": "i"}}
        matches = list(users.find(query))
        
        print(f"Found {len(matches)} matches:")
        for u in matches:
            # removing expensive/sensitive fields for display
            display_u = {k: v for k, v in u.items() if k not in ['password', 'modules_completed']}
            if '_id' in display_u:
                display_u['_id'] = str(display_u['_id'])
                
            print(json.dumps(display_u, indent=2, cls=DateTimeEncoder))
            
            # Explicit check for verification status
            is_verified = u.get('is_verified')
            print(f"Is Verified: {is_verified} (Type: {type(is_verified)})")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_user()
