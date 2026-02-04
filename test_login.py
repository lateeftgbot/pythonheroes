import requests
import json

def test_login():
    url = "http://localhost:5000/api/auth/signin"
    # Admin credentials
    payload = {
        "email": "vectors@gmail.com",
        "password": "Lati@001"
    }
    
    print(f"Testing Login at {url}...")
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login()
