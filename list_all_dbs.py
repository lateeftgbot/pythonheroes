from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()
uri = os.getenv('MONGO_URI')

try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
    dbs = client.list_database_names()
    print(f"Databases found: {dbs}")
    for db_name in dbs:
        db = client.get_database(db_name)
        cols = db.list_collection_names()
        print(f" - {db_name}: {cols}")
        if 'users' in cols:
            count = db.users.count_documents({})
            print(f"   -> 'users' has {count} documents")
except Exception as e:
    print(f"Error: {e}")
