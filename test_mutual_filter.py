from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi
import re

# Load config
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(dotenv_path=env_path)

# MongoDB Connection
uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')

USER_A_EMAIL = "test_user_a@example.com"
USER_B_EMAIL = "test_user_b@example.com"

def get_conversations_logic(email):
    # This mirrors the logic in app.py/get_conversations
    my_ids = {email.lower().strip()}
    # Simplified mock for user search
    pattern = f"^(?:{re.escape(email.lower().strip())})$"
    
    query = {
        "$or": [
            {"sender_email": {"$regex": pattern, "$options": "i"}},
            {"sender": {"$regex": pattern, "$options": "i"}},
            {"receiver": {"$regex": pattern, "$options": "i"}}
        ]
    }
    
    msgs = list(db.direct_messages.find(query).sort("timestamp", -1))
    
    partner_latest = {}
    sent_to = set()
    received_from = set()
    
    id_pattern = re.compile(pattern, re.IGNORECASE)
    
    for m in msgs:
        s_email = str(m.get('sender_email', '')).lower().strip()
        s_name = str(m.get('sender', '')).lower().strip()
        r_id = str(m.get('receiver', '')).lower().strip()
        
        is_sender = id_pattern.match(s_email) or id_pattern.match(s_name)
        is_receiver = id_pattern.match(r_id)
        
        partner_id = None
        if is_receiver:
            partner_id = s_email if s_email else s_name
            if partner_id: received_from.add(partner_id.lower().strip())
        elif is_sender:
            partner_id = r_id
            if partner_id: sent_to.add(partner_id.lower().strip())
            
        if partner_id:
            p_lower = partner_id.lower().strip()
            if p_lower not in my_ids and p_lower not in partner_latest:
                partner_latest[p_lower] = m
                
    mutual_partners = {p for p in partner_latest if p in sent_to and p in received_from}
    return mutual_partners

def test_mutual_filter():
    print("Cleaning up test messages...")
    db.direct_messages.delete_many({
        "$or": [
            {"sender_email": USER_A_EMAIL, "receiver": USER_B_EMAIL},
            {"sender_email": USER_B_EMAIL, "receiver": USER_A_EMAIL}
        ]
    })

    print(f"\nPhase 1: One-way message (A -> B)")
    db.direct_messages.insert_one({
        "sender": "User A",
        "sender_email": USER_A_EMAIL,
        "receiver": USER_B_EMAIL,
        "content": "Hello B",
        "timestamp": "2026-02-04T20:00:00.000000"
    })
    
    mutual_a = get_conversations_logic(USER_A_EMAIL)
    mutual_b = get_conversations_logic(USER_B_EMAIL)
    
    print(f"Mutual partners for A: {mutual_a}")
    print(f"Mutual partners for B: {mutual_b}")
    
    if USER_B_EMAIL in mutual_a or USER_A_EMAIL in mutual_b:
        print("FAIL: Found partner in mutual list after one-way message.")
    else:
        print("SUCCESS: Mutual list empty for both users.")

    print(f"\nPhase 2: Return message (B -> A)")
    db.direct_messages.insert_one({
        "sender": "User B",
        "sender_email": USER_B_EMAIL,
        "receiver": USER_A_EMAIL,
        "content": "Hello A",
        "timestamp": "2026-02-04T20:01:00.000000"
    })
    
    mutual_a = get_conversations_logic(USER_A_EMAIL)
    mutual_b = get_conversations_logic(USER_B_EMAIL)
    
    print(f"Mutual partners for A: {mutual_a}")
    print(f"Mutual partners for B: {mutual_b}")
    
    if USER_B_EMAIL in mutual_a and USER_A_EMAIL in mutual_b:
        print("SUCCESS: Both users see each other in mutual list.")
    else:
        print("FAIL: One or both users missing from mutual list after return message.")

if __name__ == "__main__":
    test_mutual_filter()

