from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()

def create_verified_user():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found")
        return

    try:
        client = MongoClient(uri, tls=True, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
        db = client.get_database('vectors_db')
        users = db.users
        
        test_email = "verify_test@example.com"
        test_pass = "password123"
        
        user_data = {
            "name": "Verification User",
            "email": test_email,
            "password": test_pass, # Storing plain text as per app pattern (for now)
            "username": "verify_test",
            "role": "student",
            "is_verified": True,
            "is_active": True,
            "amount_paid": 0
        }
        
        # Upsert user
        users.update_one(
            {"email": test_email},
            {"$set": user_data},
            upsert=True
        )
        print(f"User {test_email} created/updated and verified.")
        
    except Exception as e:
        print(f"Error creating user: {e}")

if __name__ == "__main__":
    create_verified_user()
