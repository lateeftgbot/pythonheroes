"""
Manual User Cleanup Script
Use this to manually delete or re-enable users that are stuck in a bad state
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

load_dotenv()

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')
users_collection = db.users

def list_all_users():
    """List all users with their status"""
    print("\n=== ALL USERS ===\n")
    users = list(users_collection.find({}, {"password": 0}))
    
    for i, user in enumerate(users, 1):
        print(f"{i}. {user.get('name')} ({user.get('email')})")
        print(f"   ID: {user.get('_id')} (type: {type(user.get('_id')).__name__})")
        print(f"   Active: {user.get('is_active', True)}")
        print(f"   Verified: {user.get('is_verified', False)}")
        print()
    
    return users

def delete_user_by_email(email):
    """Delete a user by their email address"""
    user = users_collection.find_one({"email": email})
    if not user:
        print(f"❌ No user found with email: {email}")
        return False
    
    result = users_collection.delete_one({"_id": user['_id']})
    if result.deleted_count > 0:
        print(f"✅ Successfully deleted user: {email}")
        return True
    else:
        print(f"❌ Failed to delete user: {email}")
        return False

def reactivate_user(email):
    """Reactivate a disabled user"""
    result = users_collection.update_one(
        {"email": email},
        {"$set": {"is_active": True, "is_disabled": False}}
    )
    if result.modified_count > 0:
        print(f"✅ Successfully reactivated user: {email}")
        return True
    else:
        print(f"❌ User not found or already active: {email}")
        return False

def main():
    print("=" * 60)
    print("USER MANAGEMENT CLEANUP TOOL")
    print("=" * 60)
    
    while True:
        print("\nOptions:")
        print("1. List all users")
        print("2. Delete user by email")
        print("3. Reactivate user by email")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            list_all_users()
        
        elif choice == "2":
            email = input("Enter email address to DELETE: ").strip()
            if email:
                confirm = input(f"⚠️  Are you sure you want to PERMANENTLY DELETE {email}? (yes/no): ").strip().lower()
                if confirm == "yes":
                    delete_user_by_email(email)
                else:
                    print("Deletion cancelled")
        
        elif choice == "3":
            email = input("Enter email address to REACTIVATE: ").strip()
            if email:
                reactivate_user(email)
        
        elif choice == "4":
            print("\nExiting...")
            break
        
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
