import requests
from pymongo import MongoClient
import os
import certifi
from dotenv import load_dotenv

load_dotenv()

# 1. Setup Test User
uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')
users = db.users

email = "test_bot_user@example.com"
password = "password123" # Should match what was used in test_signin_flow.py or reset here

# Ensure user exists and has role
user = users.find_one({"email": email})
if not user:
    print("Test user not found, cannot simulate.")
    exit(1)

# Ensure role is set
if user.get('role') != 'master1_vectors':
    print("Setting role to 'master1_vectors' for simulation...")
    users.update_one({"email": email}, {"$set": {"role": "master1_vectors"}})

# 2. Simulate Login
base_url = "http://localhost:5001/api/auth" # Updated port
print(f"Logging in as {email}...")
try:
    login_resp = requests.post(f"{base_url}/signin", json={
        "email": email,
        "password": password
    })
    
    if login_resp.status_code != 200:
        print(f"Login failed: {login_resp.status_code} - {login_resp.text}")
        # If password fail, reset it manually
        if login_resp.status_code == 401:
             print("Resetting password manually...")
             users.update_one({"email": email}, {"$set": {"password": password}})
             login_resp = requests.post(f"{base_url}/signin", json={"email": email, "password": password})
    
    auth_data = login_resp.json()
    user_data = auth_data.get('user')
    print(f"Login successful. User Role: {user_data.get('role')}")
    
    # 3. Simulate Profile Fetch
    username = user_data.get('username')
    print(f"Fetching profile for @{username}...")
    profile_url = f"http://localhost:5001/api/users/profile/{username}"
    # Note: Backend API is usually open, but frontend checks currentUser vs profileUser
    
    profile_resp = requests.get(profile_url)
    if profile_resp.status_code == 200:
        profile_data = profile_resp.json()
        print(f"Profile fetched. Role in Profile: {profile_data.get('role')}")
        
        # Verify conditions for toggle button:
        # currentUser.email === profile.email AND currentUser.role === 'master1_vectors'
        
        condition_email = (user_data.get('email') == profile_data.get('email'))
        condition_role = (user_data.get('role') == 'master1_vectors')
        
        print("\nToggle Visibility Check:")
        print(f"- Current User Email matches Profile: {condition_email}")
        print(f"- Current User Role is Master: {condition_role}")
        
        if condition_email and condition_role:
            print("RESULT: Toggle button SHOULD be visible.")
        else:
            print("RESULT: Toggle button will NOT be visible.")
            
    else:
        print(f"Failed to fetch profile: {profile_resp.status_code}")

except Exception as e:
    print(f"Simulation failed: {e}")
