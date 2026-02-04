
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(dotenv_path=env_path)

userId = os.getenv('MONGO_URI')
if not userId:
    print("Error: MONGO_URI not found in .env")
    exit(1)

try:
    client = MongoClient(userId)
    db = client.get_default_database()
    users_collection = db.users

    print(f"Users in database '{db.name}':")
    print("-" * 50)
    
    users = users_collection.find({})
    for u in users:
        status = "Active" if u.get('is_active', True) else "Suspended"
        if u.get('is_disabled'): status = "Disabled"
        
        print(f"Name:  {u.get('name', 'N/A')}")
        print(f"Email: {u.get('email', 'N/A')}")
        print(f"Role:  {u.get('role', 'user')}")
        print(f"State: {status}")
        print("-" * 50)

except Exception as e:
    print(f"An error occurred: {e}")
