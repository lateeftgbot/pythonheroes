
import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
if not uri:
    print("MONGO_URI not found")
    exit(1)

try:
    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    users_collection = db.users
    
    # correct user name based on previous context "Basiru Lateef"
    # or just list all users with master role
    
    print("--- Users with master1_vectors role ---")
    masters = users_collection.find({"role": "master1_vectors"})
    found_master = False
    for user in masters:
        found_master = True
        print(f"Name: {user.get('name')}, Email: {user.get('email')}, Role: {user.get('role')}")
        
    if not found_master:
        print("No users found with role 'master1_vectors'")

    print("\n--- Checking specific user 'Basiru Lateef' ---")
    basiru = users_collection.find_one({"name": "Basiru Lateef"})
    if basiru:
        print(f"Name: {basiru.get('name')}, Email: {basiru.get('email')}, Role: {basiru.get('role')}")
    else:
        print("User 'Basiru Lateef' not found")

except Exception as e:
    print(f"Error: {e}")
