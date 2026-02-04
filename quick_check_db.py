from pymongo import MongoClient
import certifi

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/?retryWrites=true&w=majority"
try:
    print("Connecting...")
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    db = client.get_database('vectors_db')
    # Ping
    client.admin.command('ping')
    print("Success!")
    names = db.list_collection_names()
    print(f"Collections: {names}")
except Exception as e:
    print(f"Failed: {e}")
