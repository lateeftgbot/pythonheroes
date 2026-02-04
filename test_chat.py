import requests

def test_chat():
    url = "http://localhost:5000/api/chat/messages"
    print(f"Testing Chat at {url}...")
    try:
        response = requests.get(url, timeout=5)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"Response (first 100 chars): {response.text[:100]}")
            # Try to parse as JSON
            import json
            data = response.json()
            print("Successfully parsed as JSON.")
        else:
            print(f"Error Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_chat()
