from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Connecting to: {uri[:40]}...")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    # Ping the server
    client.admin.command('ping')
    print("Ping successful!")
    db = client.get_default_database()
    print(f"Database: {db.name}")
except Exception as e:
    print(f"Error: {e}")
