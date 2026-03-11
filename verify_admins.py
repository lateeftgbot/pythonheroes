import os
from backend.app import create_app
from backend.extensions import users_collection

# Create the flask app to establish DB connection
app = create_app()

with app.app_context():
    print("-" * 30)
    print("ADMIN ACCESS VERIFICATION")
    print("-" * 30)

    # 1. Check Database Users
    print("\n[Database Check]")
    try:
        # Find users with role 'admin' or 'master1_vectors'
        admins = list(users_collection.find({
            "role": {"$in": ["admin", "master1_vectors"]}
        }))
        
        if admins:
            print(f"Found {len(admins)} privileged users in MongoDB:")
            for user in admins:
                print(f" - Name: {user.get('name')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Role: {user.get('role')}")
                print(f"   Username: {user.get('username', 'N/A')}")
                print("   ---")
        else:
            print("No users with 'admin' or 'master1_vectors' role found in the database.")
            
    except Exception as e:
        print(f"Error querying database: {e}")

    # 2. Check Hardcoded Users (from inspection of auth/routes.py)
    print("\n[Hardcoded Access Check]")
    print("The following account is hardcoded in `backend/auth/routes.py`:")
    print(" - Email: lateefolayinka@gmail.com")
    print(" - Role: admin (Bypasses database check)")

    print("-" * 30)
