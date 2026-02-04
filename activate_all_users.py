
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

    print("Connected to database:", db.name)
    
    # Count total users
    total = users_collection.count_documents({})
    print(f"Total users found: {total}")

    # Update all users to be active
    result = users_collection.update_many(
        {}, 
        {"$set": {"is_active": True, "is_disabled": False}}
    )

    print(f"Operation complete.")
    print(f"Matched: {result.matched_count}")
    print(f"Modified: {result.modified_count}")

except Exception as e:
    print(f"An error occurred: {e}")
