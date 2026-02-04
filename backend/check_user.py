import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')
users_collection = db.users

print("=== ALL USERS IN DATABASE ===\n")
users = list(users_collection.find({}, {"password": 0}))

for user in users:
    print(f"ID: {user.get('_id')} (type: {type(user.get('_id')).__name__})")
    print(f"Email: {user.get('email')}")
    print(f"Name: {user.get('name')}")
    print(f"Active: {user.get('is_active', True)}")
    print(f"Disabled: {user.get('is_disabled', False)}")
    print("-" * 50)

print(f"\nTotal users: {len(users)}")

# Check for the specific user that couldn't log in
email = input("\nEnter the email of the user who can't log in (or press Enter to skip): ").strip()
if email:
    user = users_collection.find_one({"email": email})
    if user:
        print(f"\n=== USER FOUND ===")
        print(f"ID: {user.get('_id')} (type: {type(user.get('_id')).__name__})")
        print(f"Email: {user.get('email')}")
        print(f"Name: {user.get('name')}")
        print(f"Active: {user.get('is_active', True)}")
        print(f"Disabled: {user.get('is_disabled', False)}")
        print(f"Verified: {user.get('is_verified', False)}")
        
        # Try to delete using different ID formats
        print(f"\n=== TESTING DELETION ===")
        user_id = user.get('_id')
        
        # Test 1: Direct ID
        print(f"Test 1 - Direct ID ({user_id}): ", end="")
        result = users_collection.delete_one({"_id": user_id}, dry_run=False)
        print(f"Would delete {result.deleted_count} document(s)")
        
        if result.deleted_count == 0:
            # Test 2: String ID
            print(f"Test 2 - String ID ({str(user_id)}): ", end="")
            result = users_collection.count_documents({"_id": str(user_id)})
            print(f"Found {result} document(s)")
            
            # Test 3: Int ID if numeric
            if str(user_id).isdigit():
                print(f"Test 3 - Int ID ({int(user_id)}): ", end="")
                result = users_collection.count_documents({"_id": int(user_id)})
                print(f"Found {result} document(s)")
    else:
        print(f"\n=== USER NOT FOUND ===")
        print(f"No user with email '{email}' exists in the database")
