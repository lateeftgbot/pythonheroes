from pymongo import MongoClient
import certifi
import socket

# Try to resolve the hostname manually to see if DNS is the issue
host = "vectors1.hzv73wg.mongodb.net"
print(f"Resolving {host}...")
try:
    ip = socket.gethostbyname(host)
    print(f"Resolved to: {ip}")
except Exception as e:
    print(f"DNS Resolution failed: {e}")

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/?retryWrites=true&w=majority"

try:
    # Using a shorter timeout and specific settings for the DNS issue
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000, connectTimeoutMS=10000)
    print("Attempting to list databases...")
    db_names = client.list_database_names()
    print(f"Success! Databases found: {db_names}")
    
    if "Vectors" in db_names:
        print("VERIFIED: 'Vectors' exists.")
    else:
        print("NOT FOUND: 'Vectors' does not exist.")
        
except Exception as e:
    print(f"Final Attempt Error: {e}")
