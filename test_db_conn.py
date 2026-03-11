import os
from pymongo import MongoClient
import certifi
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Testing URI: {uri}")

try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
    client.admin.command('ping')
    print("Ping succeeded!")
except Exception as e:
    print(f"Connection failed: {e}")
