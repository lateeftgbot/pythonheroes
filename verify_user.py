from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
if not uri:
    print("MONGO_URI not found")
    exit(1)

client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')
users = db.users

email = "test_bot_user@example.com"
result = users.update_one(
    {"email": email},
    {"$set": {"is_verified": True}}
)

if result.modified_count > 0:
    print(f"Successfully verified {email}")
elif result.matched_count > 0:
    print(f"{email} was already verified")
else:
    print(f"User {email} not found")
