from pymongo import MongoClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

def count_cache():
    uri = os.getenv('MONGO_URI')
    client = MongoClient(uri, tls=True, tlsCAFile=certifi.where(), tlsAllowInvalidCertificates=True)
    db = client.get_database('vectors_db')
    cache = db.ai_cache
    count = cache.count_documents({"category": "basic"})
    print(f"Current basic lessons in cache: {count}")

if __name__ == "__main__":
    count_cache()
