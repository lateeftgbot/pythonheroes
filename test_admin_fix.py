import requests

def test_admin_auth():
    # Email of a user who is likely an admin in the DB (based on previous logs)
    # akanfetaiwo2019@gmail.com appeared in logs earlier
    test_email = "akanfetaiwo2019@gmail.com"
    
    print(f"Testing admin access for {test_email}...")
    headers = {"X-Admin-Email": test_email}
    
    # Try to access the users list
    try:
        response = requests.get("http://localhost:5001/api/admin/users", headers=headers)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("SUCCESS: Admin access granted!")
        else:
            print(f"FAILED: {response.json().get('error', 'Unknown error')}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_admin_auth()
