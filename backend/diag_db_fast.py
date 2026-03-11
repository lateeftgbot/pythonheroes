import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')
users_collection = db.users

print(f"Total users: {users_collection.count_documents({})}")
print(f"Verified users: {users_collection.count_documents({'is_verified': True})}")

# Check for existence of joined_at
sample = users_collection.find_one({'is_verified': True})
if sample:
    print(f"Sample 'joined_at': {sample.get('joined_at')}")
else:
    print("No verified users found.")
