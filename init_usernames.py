from backend import extensions
from backend.utils import ensure_connection

def init_usernames():
    if not ensure_connection():
        print("Failed to connect to database.")
        return

    users = extensions.users_collection.find({"username": {"$exists": False}})
    null_users = extensions.users_collection.find({"username": None})
    
    count = 0
    # Handle missing field
    for user in users:
        email = user.get('email')
        if email:
            default_username = email.split('@')[0]
            # Ensure uniqueness check could be added here, but for now simple split
            extensions.users_collection.update_one({"_id": user["_id"]}, {"$set": {"username": default_username}})
            print(f"Set username for {email} to {default_username}")
            count += 1

    # Handle null values
    for user in null_users:
        email = user.get('email')
        if email:
            default_username = email.split('@')[0]
            extensions.users_collection.update_one({"_id": user["_id"]}, {"$set": {"username": default_username}})
            print(f"Fixed null username for {email} to {default_username}")
            count += 1

    print(f"Finished. Updated {count} users.")

if __name__ == "__main__":
    init_usernames()
