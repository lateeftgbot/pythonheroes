from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv('MONGO_URI')
print(f"Testing connection to: {uri[:40]}...")

try:
    # Test 1: Standard connection (letting OS handle certs)
    print("\nAttempt 1: Standard connection...")
    client1 = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client1.admin.command('ping')
    print("Success: Standard connection worked!")
except Exception as e:
    print(f"Failed: Standard connection: {e}")

try:
    # Test 2: With tlsAllowInvalidCertificates (for debugging)
    print("\nAttempt 2: With tlsAllowInvalidCertificates=True...")
    client2 = MongoClient(uri, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=5000)
    client2.admin.command('ping')
    print("Success: Connection with tlsAllowInvalidCertificates worked!")
except Exception as e:
    print(f"Failed: Connection with tlsAllowInvalidCertificates: {e}")
