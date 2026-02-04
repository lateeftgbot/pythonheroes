from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Connecting to: {uri[:40]}...")

try:
    # No certifi
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    db = client.get_default_database()
    print(f"Connected to database: {db.name}")
    
    print("Indexes on 'users' collection:")
    for index in db.users.list_indexes():
        print(index)

except Exception as e:
    print(f"Error: {e}")
