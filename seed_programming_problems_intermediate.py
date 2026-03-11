import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi
import random

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def generate_400_intermediate_tasks():
    tasks = []
    
    # 1. Advanced List Comprehensions (80 variants)
    for i in range(1, 81):
        n = random.randint(10, 50)
        div = random.randint(2, 5)
        tasks.append({
            "title": f"Intermediate List Comp {i}",
            "desc": f"Create a list of numbers from 1 to {n} that are divisible by {div} using a single list comprehension and print it."
        })
        
    # 2. Dictionary Manipulation (80 variants)
    fruit_prices = {"apple": 2, "banana": 1, "cherry": 3, "date": 5}
    for i in range(1, 81):
        task_type = random.choice([
            "Filter dictionary: Given prices {prices}, create a new dict with items costing more than {val}.",
            "Invert dictionary: Swap keys and values in {prices}.",
            "Merge dictionaries: Combine {prices} with {{'elderberry': 10, 'fig': 4}}."
        ])
        val = random.randint(1, 4)
        tasks.append({
            "title": f"Intermediate Dict Task {i}",
            "desc": task_type.format(prices=fruit_prices, val=val)
        })

    # 3. Sets & Logic (80 variants)
    for i in range(1, 81):
        setA = set(random.sample(range(1, 20), 5))
        setB = set(random.sample(range(1, 20), 5))
        op = random.choice(["union", "intersection", "symmetric difference", "difference (A-B)"])
        tasks.append({
            "title": f"Intermediate Set Task {i}",
            "desc": f"Given setA={setA} and setB={setB}, calculate and print their {op}."
        })

    # 4. Functional Programming (80 variants)
    for i in range(1, 81):
        nums = random.sample(range(1, 30), 6)
        func_type = random.choice([
            f"Use 'map' and a lambda to double all values in {nums}.",
            f"Use 'filter' and a lambda to keep only values over 15 in {nums}.",
            f"Use 'sorted' with a key lambda to sort strings ['apple', 'pear', 'fig'] by length."
        ])
        tasks.append({
            "title": f"Functional Python {i}",
            "desc": func_type
        })

    # 5. Modular Logic & Functions (80 variants)
    for i in range(1, 81):
        tasks.append({
            "title": f"Algorithmic Logic {i}",
            "desc": f"Write a function that takes a list of strings and returns a list of only those that are palindromes (like 'radar')."
        })

    return tasks[:400]

def seed_intermediate_batch():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.problem_sets

    all_tasks = generate_400_intermediate_tasks()
    now = datetime.datetime.utcnow().isoformat()
    problem_sets_data = []
    
    # Start numbering even higher to avoid collisions
    start_id = 2000 
    
    for task in all_tasks:
        new_set = {
            "name": task["title"],
            "description": "",
            "problems": [
                {
                    "id": str(start_id),
                    "difficulty": "Intermediate",
                    "description": task["desc"]
                }
            ],
            "updated_at": now,
            "created_at": now,
            "category": "Intermediate Practice"
        }
        problem_sets_data.append(new_set)
        start_id += 1

    try:
        result = collection.insert_many(problem_sets_data)
        print(f"Successfully seeded {len(result.inserted_ids)} INTERMEDIATE programming problem sets.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_intermediate_batch()
