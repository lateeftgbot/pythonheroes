import requests
import json

BASE_URL = "http://localhost:5001"

def test_project_ops():
    test_email = "verify_test@example.com"
    
    # 1. Test Save
    save_data = {
        "email": test_email,
        "title": "API Test Project",
        "code": "print('Hello from API test')",
        "language": "python"
    }
    
    print(f"Testing Save Project to {BASE_URL}/api/code/v1/save...")
    resp = requests.post(f"{BASE_URL}/api/code/v1/save", json=save_data)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")
    
    if resp.status_code == 200:
        print("SUCCESS: Project saved.")
    else:
        print("FAIL: Project save failed.")
        return

    # 2. Test List
    print(f"\nTesting List Projects for {test_email}...")
    resp = requests.get(f"{BASE_URL}/api/code/v1/list?email={test_email}")
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Found {len(data)} projects.")
        found = any(p['title'] == "API Test Project" for p in data)
        if found:
            print("SUCCESS: Test project found in list.")
        else:
            print("FAIL: Test project not found in list.")
    else:
        print("FAIL: Project listing failed.")

if __name__ == "__main__":
    test_project_ops()
