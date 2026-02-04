from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi
import datetime

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env'))
load_dotenv(dotenv_path=env_path)

uri = os.getenv('MONGO_URI')
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')

print(f"Testing connection to {db.name}...")

users = list(db.users.find())
print(f"Found {len(users)} users.")

for u in users:
    ls = u.get('last_seen')
    print(f"User: {u.get('email')}, last_seen type: {type(ls)}, value: {ls}")
    
    # Test check_online_status logic
    if ls:
        try:
            if isinstance(ls, str):
                clean_str = ls.replace('Z', '+00:00')
                if '.' in clean_str:
                    parts = clean_str.split('.')
                    if '+' in parts[1]:
                        clean_str = parts[0] + '+' + parts[1].split('+')[1]
                    else:
                        clean_str = parts[0]
                dt = datetime.datetime.fromisoformat(clean_str)
                print(f"  -> Parsed string OK: {dt}")
            elif isinstance(ls, datetime.datetime):
                print(f"  -> Already datetime OK: {ls}")
            else:
                print(f"  -> UNKNOWN TYPE: {type(ls)}")
        except Exception as e:
            print(f"  -> FAILED to parse: {e}")
