
import requests
import json
import time
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

# Load environment
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(dotenv_path=env_path)

BASE_URLS = ["http://localhost:5001"]

def get_db():
    uri = os.getenv('MONGO_URI')
    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_default_database()
    return db

def seed_user():
    print("Seeding test user...")
    db = get_db()
    users = db.users
    
    # Remove existing test user
    users.delete_one({"username": "testverifier"})
    
    test_user = {
        "name": "Test Verifier",
        "email": "verifier@test.com",
        "username": "testverifier",
        "password": "password123",
        "is_verified": True,
        "is_active": True,
        "role": "student",
        "joined_at": "2024-01-01",
        "profile_picture": None,
        "last_seen": "2025-01-01T00:00:00" # offline
    }
    users.insert_one(test_user)
    
    # Test user without username
    users.delete_one({"email": "nousername@test.com"})
    test_user_no_username = {
        "name": "Harry Potter",
        "email": "nousername@test.com",
        "username": None,
        "password": "password123",
        "is_verified": True,
        "is_active": True,
        "role": "student",
        "joined_at": "2024-01-01",
        "profile_picture": None,
        "last_seen": "2025-01-01T00:00:00"
    }
    users.insert_one(test_user_no_username)

    # Test unverified user
    users.delete_one({"email": "unverified@test.com"})
    test_user_unverified = {
        "name": "Ron Weasley",
        "email": "unverified@test.com",
        "username": "ron",
        "password": "password123",
        "is_verified": False,
        "is_active": True,
        "role": "student",
        "joined_at": "2024-01-01",
        "profile_picture": None,
        "last_seen": "2025-01-01T00:00:00"
    }
    users.insert_one(test_user_unverified)
    print("Test users seeded.")

def find_active_server():
    print("Searching for active server...")
    for i in range(5):
        for url in BASE_URLS:
            try:
                requests.get(f"{url}/api/health", timeout=1)
                return url
            except Exception as e:
                pass
        time.sleep(1)
    return None

def test_search(base_url):
    print(f"\nScanning: Testing Search API ({base_url}/api/users/search)...")
    try:
        resp = requests.get(f"{base_url}/api/users/search?q=verifier")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Result: {json.dumps(data, indent=2)}")
            if isinstance(data, list) and len(data) > 0 and data[0]['username'] == 'testverifier':
                print("SUCCESS: Search returned test user")
            else:
                print("FAIL: Search did not return test user")
        else:
            print(f"FAIL: Search failed with {resp.text}")
    except Exception as e:
        print(f"FAIL: Search Exception: {e}")

def test_profile(base_url, username):
    print(f"\nScanning: Testing Profile API ({base_url}/api/users/profile/{username})...")
    try:
        resp = requests.get(f"{base_url}/api/users/profile/{username}")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Result: {json.dumps(data, indent=2)}")
            required = ["name", "username", "overall_progress", "modules_completed"]
            missing = [k for k in required if k not in data]
            if not missing and data['username'] == 'testverifier':
                print("SUCCESS: Profile returned valid data")
            else:
                print(f"FAIL: Profile missing fields: {missing}")
        else:
            print(f"FAIL: Profile failed with {resp.text}")
    except Exception as e:
        print(f"FAIL: Profile Exception: {e}")

def test_search_fallback(base_url):
    print(f"\nScanning: Testing Search Fallback ({base_url}/api/users/search)...")
    try:
        resp = requests.get(f"{base_url}/api/users/search?q=Harry")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Result: {json.dumps(data, indent=2)}")
            # Expecting username to be 'harry' (derived from "Harry Potter")
            matching = [u for u in data if u['name'] == 'Harry Potter']
            if matching and matching[0]['username'] == 'harry':
                print("SUCCESS: Fallback username derived correctly")
            else:
                print("FAIL: Fallback username check failed")
        else:
            print(f"FAIL: Search failed with {resp.text}")
    except Exception as e:
        print(f"FAIL: Search Exception: {e}")

def test_search_unverified(base_url):
    print(f"\nScanning: Testing Search Unverified ({base_url}/api/users/search)...")
    try:
        resp = requests.get(f"{base_url}/api/users/search?q=Ron")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Result: {json.dumps(data, indent=2)}")
            if not data:
                print("SUCCESS: Unverified user NOT found (as expected)")
            else:
                print("FAIL: Unverified user found (unexpected)")
        else:
            print(f"FAIL: Search failed with {resp.text}")
    except Exception as e:
        print(f"FAIL: Search Exception: {e}")

def test_search_multi_term(base_url):
    print(f"\nScanning: Testing Multi-term Search ({base_url}/api/users/search)...")
    # Scenario: User has Name="Henry", Email="henryjacob..."
    # Query: "Henry jacob" should match because "Henry" matches Name and "jacob" matches Email
    try:
        # We need data that supports this. The seeded "Test Verifier" (verifier@test.com)
        # matches "Test" (Name) and "verifier" (Email/Name)
        # Let's search "Test verifier"
        resp = requests.get(f"{base_url}/api/users/search?q=Test%20verifier")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Result: {json.dumps(data, indent=2)}")
            if data and data[0]['name'] == 'Test Verifier':
                print("SUCCESS: Multi-term search worked")
            else:
                print("FAIL: Multi-term search failed to find user")
        else:
            print(f"FAIL: Search failed with {resp.text}")
    except Exception as e:
        print(f"FAIL: Search Exception: {e}")

def test_profile_lookup_fallback(base_url):
    print(f"\nScanning: Testing Profile Lookup via Synthetic Username ({base_url}/api/users/profile/harry)...")
    # "Harry Potter" has no username in DB. Search returns "harry".
    # Frontend navigates to /profile/harry. API must find "Harry Potter" using "harry".
    try:
        resp = requests.get(f"{base_url}/api/users/profile/harry")
        print(f"Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"Result: {json.dumps(data, indent=2)}")
            if data['name'] == 'Harry Potter':
                print("SUCCESS: Found user via synthetic username")
            else:
                print("FAIL: Found wrong user")
        else:
            print(f"FAIL: Profile lookup failed with {resp.text}")
    except Exception as e:
        print(f"FAIL: Profile Exception: {e}")

if __name__ == "__main__":
    try:
        seed_user()
    except Exception as e:
        print(f"WARNING: Could not seed user ({e}). Tests might fail if user doesn't exist.")

    url = find_active_server()
    if url:
        print(f"Connected to server at {url}")
        test_search(url)
        test_profile(url, "testverifier")
        test_search_fallback(url)
        test_search_unverified(url)
        test_search_multi_term(url)
        test_profile_lookup_fallback(url)
    else:
        print("Could not find active server. Please make sure the backend is running.")
