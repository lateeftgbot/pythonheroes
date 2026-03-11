import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Testing connection to: {uri.split('@')[1] if '@' in uri else 'Wait, invalid URI format'}")

try:
    print("Attempting connection with SIMPLIFIED parameters...")
    client = MongoClient(uri, tlsCAFile=certifi.where())
    
    # Force a call to check connection
    client.admin.command('ping')
    print("SUCCESS: Connection established and pinged.")
    
    db = client.get_database('vectors_db')
    print(f"Database accessed: {db.name}")
    
    collections = db.list_collection_names()
    print(f"Collections: {collections}")
    
except Exception as e:
    print(f"FAILURE: Connection failed.")
    print(f"Error details: {e}")
