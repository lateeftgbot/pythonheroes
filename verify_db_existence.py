from pymongo import MongoClient
import certifi

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/?retryWrites=true&w=majority"

print("--- CLUSTER DATABASE DISCOVERY ---")
try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=15000)
    
    # List all database names
    db_names = client.list_database_names()
    
    print(f"Databases found: {db_names}")
    
    target = "Vectors"
    if target in db_names:
        print(f"VERIFIED: The database '{target}' EXISTS.")
        db = client.get_database(target)
        print(f"Collections in '{target}': {db.list_collection_names()}")
    else:
        print(f"NOT FOUND: The database '{target}' does NOT exist in this cluster yet.")
        
    # Check for similar names
    similar = [name for name in db_names if name.lower() == target.lower() and name != target]
    if similar:
        print(f"Found similar database(s): {similar}")

except Exception as e:
    print(f"Connection/Discovery Error: {e}")
