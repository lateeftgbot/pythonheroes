
import requests
import json

base_url = "http://127.0.0.1:5001"

def test_signup():
    print("Testing signup...")
    url = f"{base_url}/api/auth/signup"
    data = {"email": "testuser@example.com", "password": "password123", "name": "Test User"}
    try:
        response = requests.post(url, json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Failed to connect: {e}")

if __name__ == "__main__":
    test_signup()
