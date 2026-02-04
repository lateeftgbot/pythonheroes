
import os
from pymongo import MongoClient

MONGO_URI=os.environ.get("mongodb+srv://Vectors:LateefMDB001@vectors1.hzv73wg.mongodb.net/vectors_db?retryWrites=true&w=majority")


sender = MongoClient(MONGO_URI)

db = sender.list_database_names()

if db:
    print(6)    

for x in db:
    print(db)