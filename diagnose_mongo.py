from pymongo import MongoClient
import certifi
import requests
import sys

# Try to get public IP
try:
    public_ip = requests.get('https://api.ipify.org').text
    print(f"Your current public IP is: {public_ip}")
except:
    print("Could not determine public IP.")

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/vectors_db?retryWrites=true&w=majority"

print("\n--- Testing MongoDB Connection ---")
try:
    # Try with certifi
    print("Attempt 1: With certifi...")
    client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=15000)
    client.admin.command('ping')
    print("SUCCESS: Connection established via certifi.")
except Exception as e:
    print(f"FAILED: Certifi attempt failed: {e}")
    
    try:
        # Try without certifi
        print("\nAttempt 2: Without explicit certifi...")
        client = MongoClient(uri, serverSelectionTimeoutMS=15000)
        client.admin.command('ping')
        print("SUCCESS: Connection established via OS default.")
    except Exception as e2:
        print(f"FAILED: OS default attempt failed: {e2}")
        
        try:
            # Try with allowing invalid certificates (DEBUG ONLY)
            print("\nAttempt 3: With tlsAllowInvalidCertificates=True (Debug Mode)...")
            client = MongoClient(uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=15000)
            client.admin.command('ping')
            print("SUCCESS: Connection established with certificate validation disabled.")
        except Exception as e3:
            print(f"FAILED: All attempts failed. Last error: {e3}")

print("\nIf all attempts failed with 'SSL handshake failed', please ensure your IP is whitelisted in Atlas.")
