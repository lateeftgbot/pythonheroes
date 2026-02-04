from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi
import json

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env'))
load_dotenv(dotenv_path=env_path)

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')

print(f"Collections: {db.list_collection_names()}")

sample = list(db.direct_messages.find().limit(5))
# Convert ObjectId to string for JSON serialization
for s in sample:
    s['_id'] = str(s['_id'])

print("Sample Direct Messages:")
print(json.dumps(sample, indent=2))

user_count = db.users.count_documents({})
print(f"User Count: {user_count}")

admin = db.users.find_one({"role": "admin"})
if admin:
    admin['_id'] = str(admin['_id'])
    print(f"Admin Found: {json.dumps(admin, indent=2)}")
else:
    print("Admin NOT found in database")
