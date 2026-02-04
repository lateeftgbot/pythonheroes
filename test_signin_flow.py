import requests
import uuid

def test_full_flow():
    base_url = "http://localhost:5000/api/auth"
    email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "password123"
    name = "Test User"
    
    print(f"1. Registering {email}...")
    reg_resp = requests.post(f"{base_url}/signup", json={
        "name": name,
        "email": email,
        "password": password
    })
    print(f"Signup Result: {reg_resp.status_code} - {reg_resp.json()}")
    
    if reg_resp.status_code != 201:
        return
        
    print(f"2. Simulating backend verification for {email}...")
    # Since we can't easily get the token from email, we'll manually verify in DB
    from pymongo import MongoClient
    import certifi
    client = MongoClient("mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/?retryWrites=true&w=majority", tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    db.users.update_one({"email": email}, {"$set": {"is_verified": True}})
    print("Verification spoofed in DB.")
    
    print(f"3. Attempting Sign-In as {email}...")
    login_resp = requests.post(f"{base_url}/signin", json={
        "email": email,
        "password": password
    })
    print(f"Login Result: {login_resp.status_code} - {login_resp.json()}")

if __name__ == "__main__":
    test_full_flow()
