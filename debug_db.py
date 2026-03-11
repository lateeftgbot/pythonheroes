from pymongo import MongoClient
import certifi
import os

uri = "mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(uri, tlsCAFile=certifi.where())
db = client.get_database('vectors_db')

emails = ['lateefolayinka97@gmail.com']
for email in emails:
    user = db.users.find_one({'email': email})
    if user:
        print(f"User: {email}, Role: {user.get('role')}")
    else:
        print(f"User: {email} not found")

count = db.problem_sets.count_documents({})
print(f"Total problem sets: {count}")

if count > 0:
    first = db.problem_sets.find_one()
    print(f"First set ID: {first.get('_id')}")
    print(f"First set Name: {first.get('name')}")
    print(f"First set Problems Count: {len(first.get('problems', []))}")
