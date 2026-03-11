import requests

def test_signin():
    url = "http://localhost:5001/api/auth/signin"
    # Testing with an existing user from the migration output
    data = {"email": "lateefdocuments@gmail.com", "password": "password"} # I need to check password or use a known one
    # Wait, I don't know the password... let me check the admin login instead since I know that one
    
    # Test Admin login
    admin_data = {"email": "lateefolayinka@gmail.com", "password": "Lati@001"}
    response = requests.post(url, json=admin_data)
    print("Admin Sign-in Response:")
    print(response.json())

    # Test student login if I can find a password or if I just check the DB returned fields in a mock way
    # Instead of full HTTP for student (since I don't have passwords), 
    # I'll check if any user has a username now.

def test_profile_retrieval():
    # Test the public profile endpoint
    username = "Lateif" # From the migration output
    url = f"http://localhost:5001/api/users/profile/{username}"
    response = requests.get(url)
    print(f"\nProfile Retrieval for '{username}':")
    if response.status_code == 200:
        print(response.json())
    else:
        print(f"Error: {response.status_code}, {response.text}")

if __name__ == "__main__":
    test_signin()
    test_profile_retrieval()
