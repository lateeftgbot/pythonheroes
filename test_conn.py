from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Testing connection to: {uri[:40]}...")

try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth.
    client.admin.command('ismaster')
    print("Connection successful!")
    
    db = client.get_default_database()
    print(f"Connected to database: {db.name}")
    
    collections = db.list_collection_names()
    print(f"Collections: {collections}")
    
    users_count = db.users.count_documents({})
    print(f"Users in collection: {users_count}")
    
    print("Checking indexes on 'users' collection:")
    for index in db.users.list_indexes():
        print(index)

except Exception as e:
    print(f"Connection failed: {e}")
    import traceback
    traceback.print_exc()
