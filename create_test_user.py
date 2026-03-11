from pymongo import MongoClient
import certifi
import os
from dotenv import load_dotenv

load_dotenv()

def create_test_user():
    uri = os.getenv('MONGO_URI')
    client = MongoClient(uri, tls=True, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
    db = client.get_database('vectors_db')
    users = db.users
    
    test_email = "test_master@example.com"
    existing_user = users.find_one({"email": test_email})
    
    if not existing_user:
        user_data = {
            "name": "Test Master",
            "email": test_email,
            "password": "hashed_password_placeholder",
            "role": "student",
            "is_verified": True,
            "is_active": True
        }
        users.insert_one(user_data)
        print(f"Created test user: {test_email}")
    else:
        print(f"Test user already exists: {test_email}")
        # Reset role to student
        users.update_one({"email": test_email}, {"$set": {"role": "student"}})
        print("Reset role to student.")

if __name__ == "__main__":
    create_test_user()
