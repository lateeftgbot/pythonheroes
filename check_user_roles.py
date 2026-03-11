from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tls=True, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
db = client.get_database('vectors_db')
users = db.users.find({}, {"email": 1, "role": 1, "is_admin": 1, "name": 1})

print("User Roles in Database:")
for user in users:
    print(f"Name: {user.get('name')}, Email: {user.get('email')}, Role: {user.get('role')}, Is Admin: {user.get('is_admin')}")
