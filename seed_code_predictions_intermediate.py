import os
import datetime
import random
import cmath
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def generate_challenges():
    challenges = []
    
    # 1. While Loops & State (100 variants)
    for i in range(1, 101):
        start = random.randint(1, 10)
        limit = random.randint(15, 30)
        step = random.randint(2, 4)
        code = f"""
x = {start}
count = 0
while x < {limit}:
    x += {step}
    count += 1
print(count)
"""
        # Calculate result
        x = start
        count = 0
        while x < limit:
            x += step
            count += 1
        
        correct = str(count)
        options = sorted(list(set([correct, str(count+1), str(count-1), str(count+2)])))
        
        challenges.append({
            "title": f"Dynamic Loop {i}",
            "code": code.strip(),
            "correct": correct,
            "options": options,
            "difficulty": "Intermediate"
        })

    # 2. Functions & *args (80 variants)
    for i in range(1, 81):
        vals = random.sample(range(1, 20), 3)
        code = f"""
def multi_sum(*args):
    res = 0
    for n in args:
        if n > 10:
            res += n
    return res

print(multi_sum({', '.join(map(str, vals))}))
"""
        res = sum([v for v in vals if v > 10])
        correct = str(res)
        options = sorted(list(set([correct, str(res+5), str(res-2), "0"])))
        
        challenges.append({
            "title": f"Flex Args {i}",
            "code": code.strip(),
            "correct": correct,
            "options": options,
            "difficulty": "Intermediate"
        })

    # 3. Class & OOP (80 variants)
    for i in range(1, 81):
        init_val = random.randint(5, 15)
        inc = random.randint(2, 5)
        code = f"""
class Counter:
    def __init__(self, start):
        self.val = start
    def tick(self, n):
        self.val += n
        return self.val

c = Counter({init_val})
print(c.tick({inc}))
"""
        res = init_val + inc
        correct = str(res)
        options = sorted(list(set([correct, str(init_val), str(inc), str(res+inc)])))
        
        challenges.append({
            "title": f"Object State {i}",
            "code": code.strip(),
            "correct": correct,
            "options": options,
            "difficulty": "Intermediate"
        })

    # 4. Try-Except Logic (70 variants)
    for i in range(1, 71):
        denom = random.choice([0, 2, 5])
        val = random.randint(10, 20)
        code = f"""
try:
    res = {val} // {denom}
except ZeroDivisionError:
    res = -1
finally:
    res += 1
print(res)
"""
        try:
            res = val // denom
        except ZeroDivisionError:
            res = -1
        res += 1
        
        correct = str(res)
        options = sorted(list(set([correct, "0", str(val), "-1"])))
        
        challenges.append({
            "title": f"Safety Net {i}",
            "code": code.strip(),
            "correct": correct,
            "options": options,
            "difficulty": "Intermediate"
        })

    # 5. Math & Complex (70 variants)
    for i in range(1, 71):
        real = random.randint(1, 5)
        imag = random.randint(1, 5)
        code = f"""
import cmath
z = complex({real}, {imag})
print(int(abs(z)))
"""
        res = int(abs(complex(real, imag)))
        correct = str(res)
        options = sorted(list(set([correct, str(real), str(imag), str(real+imag)])))
        
        challenges.append({
            "title": f"Complex Vector {i}",
            "code": code.strip(),
            "correct": correct,
            "options": options,
            "difficulty": "Intermediate"
        })

    # 6. Hybrid Mixture (100 variants)
    for i in range(1, 101):
        limit = random.randint(3, 6)
        code = f"""
data = {{'a': 10, 'b': 20}}
def process(n):
    res = []
    i = 0
    while i < n:
        res.append(i * 2)
        i += 1
    return res

out = process({limit})
print(len(out))
"""
        correct = str(limit)
        options = sorted(list(set([correct, str(limit*2), "0", str(limit-1)])))
        
        challenges.append({
            "title": f"System Hybrid {i}",
            "code": code.strip(),
            "correct": correct,
            "options": options,
            "difficulty": "Intermediate"
        })

    random.shuffle(challenges)
    return challenges[:500]

def seed_data():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    challenges = generate_challenges()
    
    try:
        # Get current count to set IDs
        current_count = collection.count_documents({})
        for idx, ch in enumerate(challenges):
            ch["id"] = current_count + idx + 1
        
        result = collection.insert_many(challenges)
        print(f"Successfully seeded {len(result.inserted_ids)} INTERMEDIATE code challenges.")
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_data()
