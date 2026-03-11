import requests
import json

BASE_URL = "http://localhost:5001"

def test_get_problem_sets():
    print("Testing GET /api/learning/problem-sets...")
    try:
        response = requests.get(f"{BASE_URL}/api/learning/problem-sets")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} problem sets.")
            if len(data) > 0:
                print("First problem set sample:")
                print(json.dumps(data[0], indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_get_materials():
    print("\nTesting GET /api/learning/materials (to ensure it wasn't broken)...")
    try:
        response = requests.get(f"{BASE_URL}/api/learning/materials")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} materials.")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_get_problem_sets()
    test_get_materials()
