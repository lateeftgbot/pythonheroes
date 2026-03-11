import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi
import random

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def generate_500_tasks():
    tasks = []
    
    # Categories: Arithmetic, Strings, Lists, Dictionaries, Logic, Loops, Functions
    
    # 1. Arithmetic (100 variants)
    for i in range(1, 101):
        a = random.randint(2, 100)
        b = random.randint(2, 50)
        ops = [
            ("Add", "+", "sum"),
            ("Multiply", "*", "product"),
            ("Subtract", "-", "difference"),
            ("Divide", "/", "quotient")
        ]
        op_name, op_sym, res_name = random.choice(ops)
        tasks.append({
            "title": f"Arithmetic {i}: {op_name} {a} and {b}",
            "desc": f"Create variables x={a} and y={b}. Calculate their {res_name} using '{op_sym}' and print the result."
        })
        
    # 2. Strings (100 variants)
    string_templates = [
        "Create a string '{word}' and print it in {case}.",
        "Print the {pos} character of the string '{word}'.",
        "Slice the first {num} characters of '{word}' and print it.",
        "Check if '{word}' starts with '{prefix}' and print the result.",
        "Count how many times '{char}' appears in '{word}'."
    ]
    words = ["Python", "Learning", "Code", "Brain", "Vector", "Lative", "Data", "Science", "Algor", "Logic"]
    for i in range(1, 101):
        word = random.choice(words)
        tmpl = random.choice(string_templates)
        if "case" in tmpl:
            case = random.choice(["uppercase", "lowercase"])
            desc = tmpl.format(word=word, case=case)
        elif "pos" in tmpl:
            pos = random.choice(["first", "last", "third"])
            desc = tmpl.format(word=word, pos=pos)
        elif "num" in tmpl:
            num = random.randint(2, 4)
            desc = tmpl.format(word=word, num=num)
        elif "prefix" in tmpl:
            prefix = word[:2]
            desc = tmpl.format(word=word, prefix=prefix)
        else:
            char = random.choice(word)
            desc = tmpl.format(word=word, char=char)
            
        tasks.append({
            "title": f"String Task {i}: {word} processing",
            "desc": desc
        })

    # 3. Lists (100 variants)
    for i in range(1, 101):
        items = random.sample(range(1, 100), random.randint(3, 6))
        list_op = random.choice(["length", "sum", "max", "min", "first item", "last item"])
        tasks.append({
            "title": f"List Operation {i}: {list_op}",
            "desc": f"Given the list {items}, calculate and print its {list_op}."
        })

    # 4. Logic & Comparisons (100 variants)
    for i in range(1, 101):
        val = random.randint(1, 200)
        comp = random.choice([
            (f"is {val} greater than 100?", "> 100"),
            (f"is {val} even?", "% 2 == 0"),
            (f"is {val} divisible by 10?", "% 10 == 0"),
            (f"is {val} between 50 and 150?", "50 < x < 150")
        ])
        tasks.append({
            "title": f"Logic Check {i}",
            "desc": f"Write an 'if' statement to check {comp[0]} and print 'Yes' or 'No'."
        })

    # 5. Loops & Repetition (100 variants)
    for i in range(1, 101):
        n = random.randint(3, 15)
        loop_type = random.choice([
            (f"Print numbers from 1 to {n}", f"range(1, {n}+1)"),
            (f"Print 'Hello' {n} times", f"range({n})"),
            (f"Sum numbers from 1 to {n}", f"range(1, {n}+1)")
        ])
        tasks.append({
            "title": f"Loop Task {i}: {loop_type[0]}",
            "desc": f"Use a for loop and {loop_type[1]} to complete the task: {loop_type[0]}."
        })

    return tasks

def seed_big_batch():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.problem_sets

    all_tasks = generate_500_tasks()
    now = datetime.datetime.utcnow().isoformat()
    problem_sets_data = []
    
    # Start numbering high to avoid collisions with previous seeds
    start_id = 1000 
    
    for task in all_tasks:
        new_set = {
            "name": task["title"],
            "description": "",
            "problems": [
                {
                    "id": str(start_id),
                    "difficulty": "Beginner",
                    "description": task["desc"]
                }
            ],
            "updated_at": now,
            "created_at": now,
            "category": "Basic Practice"
        }
        problem_sets_data.append(new_set)
        start_id += 1

    try:
        result = collection.insert_many(problem_sets_data)
        print(f"Successfully seeded {len(result.inserted_ids)} ADDITIONAL programming problem sets.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_big_batch()
