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

print("Searching for users with role 'master1_vectors'...")
master_users = list(users.find({"role": "master1_vectors"}))

print(f"Found {len(master_users)} master users.")
for user in master_users:
    print(f"- Name: {user.get('name')}, Email: {user.get('email')}, Username: {user.get('username')}")
