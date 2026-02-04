from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Connecting to: {uri[:40]}...")

try:
    # Use a longer timeout and explicit certifi
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
    db = client.get_default_database()
    print(f"Connected to database: {db.name}")
    
    print("Indexes on 'users' collection:")
    for index in db.users.list_indexes():
        print(index)
        
    print("\nSample user document (redacted):")
    sample = db.users.find_one()
    if sample:
        print({k: v for k, v in sample.items() if k != 'password'})
    else:
        print("No users found.")

except Exception as e:
    print(f"Error: {e}")
