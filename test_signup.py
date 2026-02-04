import requests
import uuid

url = "http://127.0.0.1:5001/api/auth/signup"
data = {
    "name": "Test User",
    "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
    "password": "Password123!"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
