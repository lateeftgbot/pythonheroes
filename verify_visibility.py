import os
import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(dotenv_path=env_path)

client = MongoClient(os.getenv('MONGO_URI'))
db = client.get_default_database()
users_collection = db.users
messages_collection = db.direct_messages

def setup_test_users():
    print("Setting up test users...")
    # Clean up existing test users
    users_collection.delete_many({"email": {"$in": ["userA@test.com", "userB@test.com"]}})
    messages_collection.delete_many({"sender_email": {"$in": ["userA@test.com", "userB@test.com"]}})
    messages_collection.delete_many({"receiver": {"$in": ["userA@test.com", "userB@test.com"]}})

    # Create User A
    userA = {
        "name": "User A",
        "email": "userA@test.com",
        "username": "usera_test",
        "role": "user",
        "joined_at": datetime.datetime.now().isoformat()
    }
    users_collection.insert_one(userA)

    # Create User B
    userB = {
        "name": "User B",
        "email": "userB@test.com",
        "username": "userb_test",
        "role": "user",
        "joined_at": datetime.datetime.now().isoformat()
    }
    users_collection.insert_one(userB)
    print("Test users A and B created.")

def get_conversations(email):
    # Mimic the backend logic
    sent_to = messages_collection.distinct("receiver", {"sender_email": email})
    sent_to_legacy = messages_collection.distinct("receiver", {"sender": email})
    received_from = messages_collection.distinct("sender_email", {"receiver": email})
    received_from_legacy = messages_collection.distinct("sender", {"receiver": email})
    
    all_potential = list(set(sent_to + sent_to_legacy + received_from + received_from_legacy))
    
    partners = []
    seen = set()
    for identifier in all_potential:
        if not identifier or identifier == email:
            continue
        
        partner = users_collection.find_one({
            "$or": [
                {"email": {"$regex": f"^{identifier}$", "$options": "i"}},
                {"username": {"$regex": f"^{identifier}$", "$options": "i"}},
                {"name": {"$regex": f"^{identifier}$", "$options": "i"}}
            ]
        })
        if partner and partner['email'] not in seen:
            partners.append(partner['email'])
            seen.add(partner['email'])
    return partners

def run_test():
    setup_test_users()
    
    # 1. A sends to B (B doesn't reply)
    print("\nScenario 1: User A sends to User B...")
    msg1 = {
        "sender": "usera_test",
        "sender_email": "userA@test.com",
        "receiver": "userB@test.com",
        "content": "Hello B, I am A",
        "timestamp": datetime.datetime.now().isoformat()
    }
    messages_collection.insert_one(msg1)
    
    # Check B's list
    b_list = get_conversations("userB@test.com")
    print(f"User B's partners: {b_list}")
    assert "userA@test.com" in b_list, "User A should be in B's list"
    print("SUCCESS: User A reflected in B's list.")
    
    # 2. Admin sends to A
    print("\nScenario 2: Admin sends to User A...")
    admin = users_collection.find_one({"role": "admin"})
    if not admin:
        print("No admin found in DB! Skipping admin test.")
    else:
        admin_email = admin['email']
        admin_name = admin.get('name', 'Admin')
        admin_username = admin.get('username', 'admin')
        
        msg2 = {
            "sender": "Vectors", # Admin custom sender name
            "sender_email": admin_email,
            "receiver": "userA@test.com",
            "content": "Hello A, this is Admin",
            "timestamp": datetime.datetime.now().isoformat()
        }
        messages_collection.insert_one(msg2)
        
        # Check A's list
        a_list = get_conversations("userA@test.com")
        print(f"User A's partners: {a_list}")
        # A should see both B (sent to) and Admin (received from)
        assert admin_email in a_list, "Admin should be in A's list"
        print(f"SUCCESS: Admin ({admin_email}) reflected in A's list.")

if __name__ == "__main__":
    try:
        run_test()
    finally:
        # Cleanup
        # users_collection.delete_many({"email": {"$in": ["userA@test.com", "userB@test.com"]}})
        # messages_collection.delete_many({"sender_email": {"$in": ["userA@test.com", "userB@test.com"]}})
        # messages_collection.delete_many({"receiver": {"$in": ["userA@test.com", "userB@test.com"]}})
        pass
