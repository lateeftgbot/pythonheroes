from pymongo import MongoClient
import certifi

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/?retryWrites=true&w=majority"

try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
    
    for name in ["vectors_db", "Vectors", "vectors"]:
        db = client.get_database(name)
        count = 0
        try:
            count = db.users.count_documents({})
        except:
            pass
        print(f"Database '{name}' has {count} users.")

except Exception as e:
    print(f"Error: {e}")
