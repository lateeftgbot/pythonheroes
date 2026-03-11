import sys
import os
import time
from dotenv import load_dotenv

load_dotenv()

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.ai_utils import AIRouter
from backend.ai_teacher.routes import SYSTEM_PROMPT

ROADMAP = [
    "Lesson 1 — Introduction to Programming: What programming is, How computers execute code, Installing Python, Running first Python program",
    "Lesson 2 — Python Syntax & Structure: Python indentation, Writing Python scripts, Comments, Python interpreter",
    "Lesson 3 — Variables: Creating variables, Naming rules, Dynamic typing",
    "Lesson 4 — Data Types: Integer, Float, String, Boolean",
    "Lesson 5 — Working with Strings: String methods, Formatting, f-strings",
    "Lesson 6 — Operators: Arithmetic, Comparison, Logical operators",
    "Lesson 7 — User Input: input() function, Converting data types",
    "Lesson 8 — Conditional Statements: if, elif, else",
    "Lesson 9 — Loops (Part 1): while loop, Loop control",
    "Lesson 10 — Loops (Part 2): for loop, Iteration",
    "Lesson 11 — Lists: Creating lists, Accessing elements, List methods",
    "Lesson 12 — Tuples: Tuple basics, Immutable objects",
    "Lesson 13 — Dictionaries: Key-value pairs, Accessing and modifying",
    "Lesson 14 — Sets: Unique data, Set operations",
    "Lesson 15 — Functions (Part 1): Defining functions, Calling functions",
    "Lesson 16 — Functions (Part 2): Parameters, Return values",
    "Lesson 17 — Modules: Importing modules, Python standard library",
    "Lesson 18 — File Handling: Reading files, Writing files",
    "Lesson 19 — Error Handling: try, except, Debugging",
    "Lesson 20 — Beginner Project: Calculator, To-do list, Number guessing game"
]

def seed_lesson(index):
    if index < 0 or index >= len(ROADMAP):
        print(f"Invalid lesson index: {index}")
        return False
        
    topic = ROADMAP[index]
    lesson_num = index + 1
    print(f"\n>>> Seeding Lesson {lesson_num}/20: {topic[:100]}...")
    
    max_retries = 2
    for attempt in range(max_retries + 1):
        try:
            # Ensure connection is fresh with long timeouts for slow DNS
            import backend.extensions as extensions
            import certifi
            from pymongo import MongoClient
            
            uri = os.getenv('MONGO_URI')
            if not extensions.client:
                print("    [~] Establishing new MongoDB connection...")
                extensions.client = MongoClient(
                    uri, 
                    tls=True,
                    tlsCAFile=certifi.where(),
                    serverSelectionTimeoutMS=30000,
                    connectTimeoutMS=30000
                )

            result, from_cache, usage = AIRouter.get_lesson(
                prompt=topic,
                category="basic",
                system_prompt=SYSTEM_PROMPT
            )
            
            if from_cache:
                print(f"    [+] Already in cache. (Cost: 0 tokens)")
            else:
                print(f"    [+] Success! Tokens used: {usage.get('total_tokens', 0)}")
            return True
            
        except Exception as e:
            err = str(e)
            if "429" in err:
                wait_time = 60
                print(f"    [!] Rate limited (429). Must wait {wait_time}s before retrying...")
                time.sleep(wait_time)
            elif "timeout" in err.lower() or "lifetime expired" in err.lower():
                print(f"    [!] Connection/DNS Timeout. Retrying (Attempt {attempt+1})...")
                time.sleep(5)
            else:
                print(f"    [!] ERROR: {e}")
                break
    return False

def run_seeding():
    print("="*50)
    print("INDIVIDUAL LESSON SEEDING START")
    print("="*50)
    
    success_count = 0
    for i in range(len(ROADMAP)):
        if seed_lesson(i):
            success_count += 1
        
        # Mandatory cool-down between lessons to stay under free tier limits
        if i < len(ROADMAP) - 1:
            print("    [~] Cooling down 10s...")
            time.sleep(10)

    print("\n" + "="*50)
    print(f"SEEDING COMPLETE: {success_count}/{len(ROADMAP)} lessons processed.")
    print("="*50)

if __name__ == "__main__":
    run_seeding()
