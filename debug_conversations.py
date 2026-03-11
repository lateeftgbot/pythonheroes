from backend import extensions
from backend.extensions import users_collection # Need this for reference but better to use extensions.users_collection
from backend.app import app
import re

def debug_conversations(email):
    print(f"DEBUGGING CONVERSATIONS FOR: {email}")
    with app.app_context():
        # 1. Check User
        # Re-fetch users_collection from extensions to ensure it is initialized
        u = extensions.users_collection.find_one({"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
        if not u:
            print("User not found!")
            return

        print(f"User found: {u.get('name')} ({u.get('_id')})")
        
        my_ids = {email.lower().strip()}
        if u.get('username'): my_ids.add(u.get('username').lower().strip())
        if u.get('name'): my_ids.add(u.get('name').lower().strip())
        if u.get('role') == 'admin': my_ids.add("vectors")
        
        print(f"My IDs: {my_ids}")

        id_list = list(my_ids)
        pattern = f"^(?:{'|'.join(map(re.escape, id_list))})$"
        id_pattern = re.compile(pattern, re.IGNORECASE)
        
        # 2. Check Messages
        query = {
            "$or": [
                {"sender_email": {"$regex": pattern, "$options": "i"}},
                {"sender": {"$regex": pattern, "$options": "i"}},
                {"receiver": {"$regex": pattern, "$options": "i"}}
            ]
        }
        
        msgs = list(extensions.db.direct_messages.find(query).sort("timestamp", -1))
        print(f"Found {len(msgs)} direct messages matching pattern.")
        
        partner_latest = {}
        for m in msgs:
            s_email = str(m.get('sender_email', '')).lower().strip()
            s_name = str(m.get('sender', '')).lower().strip()
            r_id = str(m.get('receiver', '')).lower().strip()
            
            is_sender = id_pattern.match(s_email) or id_pattern.match(s_name)
            is_receiver = id_pattern.match(r_id)
            
            partner_id = None
            if is_receiver:
                partner_id = s_email if s_email else s_name
            elif is_sender:
                partner_id = r_id
                
            print(f"Msg: {m.get('content')} | S: {s_email} | R: {r_id} | Partner: {partner_id}")
            
            if partner_id:
                p_lower = partner_id.lower().strip()
                if p_lower not in my_ids and p_lower not in partner_latest:
                    partner_latest[p_lower] = m
                    
        print(f"Identified Partners: {list(partner_latest.keys())}")

if __name__ == "__main__":
    # You can change the email here to test different users
    # Fetch random user to test or hardcode
    try:
        # Need app context to initialize extensions if not already done
        with app.app_context():
            user = extensions.users_collection.find_one()
            if user:
                debug_conversations(user['email'])
            else:
                print("No users in DB to test.")
    except Exception as e:
        print(f"Error: {e}")
