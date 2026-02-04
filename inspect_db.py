from pymongo import MongoClient
import certifi
import json

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/?retryWrites=true&w=majority"

def redact(doc):
    if not doc: return doc
    doc_copy = doc.copy()
    if 'password' in doc_copy: doc_copy['password'] = '********'
    if '_id' in doc_copy: doc_copy['_id'] = str(doc_copy['_id'])
    return doc_copy

try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=15000)
    db = client.get_database("vectors_db")
    
    print("--- DATABASE INSPECTION: vectors_db ---")
    
    # 1. Users Collection
    print("\n[Collection: users]")
    user_sample = db.users.find_one()
    if user_sample:
        print("Sample User found:")
        print(json.dumps(redact(user_sample), indent=2))
    else:
        print("No users found.")
        
    # 2. Messages Collection
    print("\n[Collection: messages]")
    msg_sample = db.messages.find_one()
    if msg_sample:
        print("Sample Message found:")
        print(json.dumps(redact(msg_sample), indent=2))
    else:
        print("No messages found.")
        
    # 3. Stats
    print("\n[Stats]")
    print(f"Total Users: {db.users.count_documents({})}")
    print(f"Total Messages: {db.messages.count_documents({})}")

except Exception as e:
    print(f"Error during inspection: {e}")
