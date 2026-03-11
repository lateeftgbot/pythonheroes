from backend.utils import ensure_connection
from backend import extensions

ensure_connection()

# Access collection after connection is established
collection = extensions.learning_materials_collection

if collection is None:
    print("ERROR: learning_materials_collection is None after connection!")
else:
    count = collection.count_documents({})
    print(f"Total materials in database: {count}")

    if count > 0:
        print("\nSample materials:")
        materials = list(collection.find().limit(5))
        for m in materials:
            print(f"- {m.get('title')} (Type: {m.get('type')}, ID: {m.get('_id')})")
    else:
        print("\nNo materials found in database!")
