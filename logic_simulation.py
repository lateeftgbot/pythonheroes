import re

def simulate_get_conversations(email, messages, my_ids):
    # This exactly reproduces the logic implemented in app.py
    id_list = list(my_ids)
    pattern = f"^(?:{'|'.join(map(re.escape, id_list))})$"
    id_pattern = re.compile(pattern, re.IGNORECASE)
    
    partner_latest = {}
    sent_to = set()
    received_from = set()
    
    for m in messages:
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

# Test Data
MY_EMAIL = "me@example.com"
MY_IDS = {MY_EMAIL}
PARTNER_B = "partner_b@example.com"
PARTNER_C = "partner_c@example.com"

# Scenario 1: One-way (Sent)
msgs1 = [
    {"sender_email": MY_EMAIL, "receiver": PARTNER_B, "content": "Hi B", "timestamp": "1"}
]
res1 = simulate_get_conversations(MY_EMAIL, msgs1, MY_IDS)
print(f"Scenario 1 (Sent only to B): {res1}") # Expect empty

# Scenario 2: One-way (Received)
msgs2 = [
    {"sender_email": PARTNER_C, "receiver": MY_EMAIL, "content": "Hi from C", "timestamp": "1"}
]
res2 = simulate_get_conversations(MY_EMAIL, msgs2, MY_IDS)
print(f"Scenario 2 (Received only from C): {res2}") # Expect empty

# Scenario 3: Mutual
msgs3 = [
    {"sender_email": MY_EMAIL, "receiver": PARTNER_B, "content": "Hi B", "timestamp": "2"},
    {"sender_email": PARTNER_B, "receiver": MY_EMAIL, "content": "Hi me", "timestamp": "1"}
]
res3 = simulate_get_conversations(MY_EMAIL, msgs3, MY_IDS)
print(f"Scenario 3 (Mutual with B): {res3}") # Expect {PARTNER_B}

# Scenario 4: Mixed
msgs4 = msgs1 + msgs2 + msgs3
res4 = simulate_get_conversations(MY_EMAIL, msgs4, MY_IDS)
print(f"Scenario 4 (Sent to B & C, Received from B): {res4}") # Expect {PARTNER_B}
