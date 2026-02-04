from pymongo import MongoClient
import certifi
import sys

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/vectors_db?retryWrites=true&w=majority"
print("Testing with certifi and 5s timeout...")
try:
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("SUCCESS")
except Exception as e:
    print(f"FAILED: {e}")
