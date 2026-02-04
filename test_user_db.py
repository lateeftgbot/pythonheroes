from pymongo import MongoClient
import certifi
import sys

# User provided connection string
uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/Vectors?retryWrites=true&w=majority"
db_name = "Vectors"

print(f"Testing connection to database: {db_name}")

try:
    # Try 1: With certifi (often required for Atlas on various systems)
    print("\nAttempt 1: With certifi...")
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
    client.admin.command('ping')
    print("Ping successful!")
    
    db = client.get_database(db_name)
    collections = db.list_collection_names()
    print(f"Connection successful! Collections in '{db_name}': {collections}")
    
    if 'users' in collections:
        count = db.users.count_documents({})
        print(f"Number of users in 'users' collection: {count}")

except Exception as e:
    print(f"Attempt 1 failed: {e}")
    
    try:
        # Try 2: Without certifi (OS default)
        print("\nAttempt 2: Without explicit certifi...")
        client = MongoClient(uri, serverSelectionTimeoutMS=10000)
        client.admin.command('ping')
        print("Ping successful!")
        
        db = client.get_database(db_name)
        collections = db.list_collection_names()
        print(f"Connection successful! Collections in '{db_name}': {collections}")
    except Exception as e2:
        print(f"Attempt 2 failed: {e2}")

print("\nFinished tests.")
