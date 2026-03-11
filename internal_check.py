from backend import extensions
from backend.utils import ensure_connection

if ensure_connection():
    users = extensions.users_collection.find({}, {"email": 1, "role": 1})
    print("User Roles:")
    for u in users:
        print(f"Email: {u.get('email')}, Role: {u.get('role')}")
else:
    print("Failed to connect")
