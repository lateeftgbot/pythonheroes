from backend import extensions
from backend.utils import ensure_connection
import json

if ensure_connection():
    users = list(extensions.users_collection.find({}, {"email": 1, "username": 1, "name": 1}))
    with open("users_output.json", "w") as f:
        json.dump(users, f, default=str)
    print("Output written to users_output.json")
else:
    print("Failed to connect")

