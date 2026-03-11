import requests
import sys

def test_search():
    url = "http://localhost:5000/api/users/search"
    try:
        print(f"Testing {url}...")
        resp = requests.get(url, timeout=5)
        print(f"Status: {resp.status_code}")
        print(f"Body: {resp.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
