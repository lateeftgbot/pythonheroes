import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_code_predictions():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    # Clear existing common predictions to avoid duplicates during seeding
    # collection.delete_many({}) 

    challenges = [
        # --- BEGINNER (15) ---
        {
            "title": "Basic Printing",
            "difficulty": "Beginner",
            "code": "print('Hello' + 'World')",
            "options": ["HelloWorld", "Hello World", "Hello+World", "Error"],
            "correct": "HelloWorld"
        },
        {
            "title": "Variable Assignment",
            "difficulty": "Beginner",
            "code": "x = 5\ny = 10\nprint(x + y)",
            "options": ["5", "10", "15", "x+y"],
            "correct": "15"
        },
        {
            "title": "String Multiplication",
            "difficulty": "Beginner",
            "code": "print('A' * 3)",
            "options": ["A", "AAA", "A3", "Error"],
            "correct": "AAA"
        },
        {
            "title": "List Indexing",
            "difficulty": "Beginner",
            "code": "colors = ['red', 'green', 'blue']\nprint(colors[1])",
            "options": ["red", "green", "blue", "IndexError"],
            "correct": "green"
        },
        {
            "title": "Simple If",
            "difficulty": "Beginner",
            "code": "x = 7\nif x > 5:\n    print('High')\nelse:\n    print('Low')",
            "options": ["High", "Low", "7", "Error"],
            "correct": "High"
        },
        {
            "title": "Basic Loop",
            "difficulty": "Beginner",
            "code": "sum = 0\nfor i in [1, 2, 3]:\n    sum += i\nprint(sum)",
            "options": ["1", "3", "6", "0"],
            "correct": "6"
        },
        {
            "title": "String Length",
            "difficulty": "Beginner",
            "code": "text = 'Python'\nprint(len(text))",
            "options": ["5", "6", "7", "Error"],
            "correct": "6"
        },
        {
            "title": "Type Conversion",
            "difficulty": "Beginner",
            "code": "x = '10'\ny = int(x) + 5\nprint(y)",
            "options": ["105", "15", "Error", "10"],
            "correct": "15"
        },
        {
            "title": "List Append",
            "difficulty": "Beginner",
            "code": "nums = [1, 2]\nnums.append(3)\nprint(len(nums))",
            "options": ["2", "3", "4", "Error"],
            "correct": "3"
        },
        {
            "title": "Boolean Logic",
            "difficulty": "Beginner",
            "code": "a = True\nb = False\nprint(a and b)",
            "options": ["True", "False", "None", "Error"],
            "correct": "False"
        },
        {
            "title": "Simple Modulo",
            "difficulty": "Beginner",
            "code": "print(10 % 3)",
            "options": ["3", "1", "0", "10"],
            "correct": "1"
        },
        {
            "title": "Floating Point",
            "difficulty": "Beginner",
            "code": "x = 5 / 2\nprint(x)",
            "options": ["2", "2.5", "2.0", "Error"],
            "correct": "2.5"
        },
        {
            "title": "Variable Re-assignment",
            "difficulty": "Beginner",
            "code": "x = 1\nx = x + 1\nx = 10\nprint(x)",
            "options": ["1", "2", "10", "11"],
            "correct": "10"
        },
        {
            "title": "String Lowercase",
            "difficulty": "Beginner",
            "code": "name = 'PY'\nprint(name.lower())",
            "options": ["PY", "py", "Py", "Error"],
            "correct": "py"
        },
        {
            "title": "List Slicing Basics",
            "difficulty": "Beginner",
            "code": "abc = ['a', 'b', 'c']\nprint(abc[:2])",
            "options": ["['a']", "['a', 'b']", "['b', 'c']", "['a', 'b', 'c']"],
            "correct": "['a', 'b']"
        },

        # --- INTERMEDIATE (20) ---
        {
            "title": "List Comprehension",
            "difficulty": "Intermediate",
            "code": "x = [i for i in range(3)]\nprint(x)",
            "options": ["[0, 1, 2, 3]", "[1, 2, 3]", "[0, 1, 2]", "[0, 1]"],
            "correct": "[0, 1, 2]"
        },
        {
            "title": "Dictionary Access",
            "difficulty": "Intermediate",
            "code": "d = {'a': 1, 'b': 2}\nprint(d.get('c', 3))",
            "options": ["1", "2", "3", "None"],
            "correct": "3"
        },
        {
            "title": "Function Scope",
            "difficulty": "Intermediate",
            "code": "x = 10\ndef f():\n    x = 5\nf()\nprint(x)",
            "options": ["10", "5", "None", "Error"],
            "correct": "10"
        },
        {
            "title": "String Splitting",
            "difficulty": "Intermediate",
            "code": "s = 'a,b,c'\nprint(len(s.split(',')))",
            "options": ["1", "2", "3", "5"],
            "correct": "3"
        },
        {
            "title": "Default Arguments",
            "difficulty": "Intermediate",
            "code": "def add(a, b=2):\n    return a + b\nprint(add(5))",
            "options": ["5", "7", "2", "Error"],
            "correct": "7"
        },
        {
            "title": "Set Uniqueness",
            "difficulty": "Intermediate",
            "code": "s = {1, 2, 2, 3}\nprint(len(s))",
            "options": ["2", "3", "4", "1"],
            "correct": "3"
        },
        {
            "title": "Lambda Function",
            "difficulty": "Intermediate",
            "code": "f = lambda x: x ** 2\nprint(f(4))",
            "options": ["8", "16", "4", "Error"],
            "correct": "16"
        },
        {
            "title": "List Sorting",
            "difficulty": "Intermediate",
            "code": "a = [3, 1, 2]\na.sort()\nprint(a)",
            "options": ["[3, 1, 2]", "[1, 2, 3]", "None", "Error"],
            "correct": "[1, 2, 3]"
        },
        {
            "title": "Dictionary Update",
            "difficulty": "Intermediate",
            "code": "d = {'a': 1}\nd['b'] = 2\nprint(len(d))",
            "options": ["1", "2", "3", "0"],
            "correct": "2"
        },
        {
            "title": "Enumeration",
            "difficulty": "Intermediate",
            "code": "for i, v in enumerate(['x']):\n    print(i)",
            "options": ["0", "1", "x", "Error"],
            "correct": "0"
        },
        {
            "title": "Zip Operation",
            "difficulty": "Intermediate",
            "code": "a = [1]\nb = [2]\nprint(list(zip(a, b)))",
            "options": ["[1, 2]", "[(1, 2)]", "[[1, 2]]", "Error"],
            "correct": "[(1, 2)]"
        },
        {
            "title": "Nested Loops",
            "difficulty": "Intermediate",
            "code": "cnt = 0\nfor i in range(2):\n    for j in range(2):\n        cnt += 1\nprint(cnt)",
            "options": ["2", "4", "1", "Error"],
            "correct": "4"
        },
        {
            "title": "String Formatting",
            "difficulty": "Intermediate",
            "code": "n = 5\nprint(f'{n+1}')",
            "options": ["5", "6", "n+1", "Error"],
            "correct": "6"
        },
        {
            "title": "Tuple Immutability",
            "difficulty": "Intermediate",
            "code": "t = (1, 2)\nt = (3, 4)\nprint(t[0])",
            "options": ["1", "3", "Error", "None"],
            "correct": "3"
        },
        {
            "title": "Range Step",
            "difficulty": "Intermediate",
            "code": "print(list(range(0, 5, 2)))",
            "options": ["[0, 1, 2, 3, 4]", "[0, 2, 4]", "[0, 2]", "[2, 4]"],
            "correct": "[0, 2, 4]"
        },
        {
            "title": "List Pop",
            "difficulty": "Intermediate",
            "code": "a = [10, 20]\nx = a.pop()\nprint(x)",
            "options": ["10", "20", "[10]", "Error"],
            "correct": "20"
        },
        {
            "title": "F-String Concatenation",
            "difficulty": "Intermediate",
            "code": "a = 'X'\nb = 'Y'\nprint(f'{a}{b}')",
            "options": ["XY", "X Y", "a b", "Error"],
            "correct": "XY"
        },
        {
            "title": "Function Return",
            "difficulty": "Intermediate",
            "code": "def check():\n    return 'OK'\n    return 'Fail'\nprint(check())",
            "options": ["OK", "Fail", "OK Fail", "None"],
            "correct": "OK"
        },
        {
            "title": "List Extend",
            "difficulty": "Intermediate",
            "code": "a = [1]\na.extend([2, 3])\nprint(len(a))",
            "options": ["2", "3", "1", "Error"],
            "correct": "3"
        },
        {
            "title": "Set Intersection",
            "difficulty": "Intermediate",
            "code": "a = {1, 2}\nb = {2, 3}\nprint(a & b)",
            "options": ["{1, 2, 3}", "{2}", "{1}", "Error"],
            "correct": "{2}"
        },

        # --- ADVANCED (15) ---
        {
            "title": "Closure Pattern",
            "difficulty": "Advanced",
            "code": "def outer(x):\n    def inner(y):\n        return x + y\n    return inner\nadd_five = outer(5)\nprint(add_five(10))",
            "options": ["5", "10", "15", "Error"],
            "correct": "15"
        },
        {
            "title": "List Reference",
            "difficulty": "Advanced",
            "code": "a = [1, 2]\nb = a\nb.append(3)\nprint(len(a))",
            "options": ["2", "3", "1", "Error"],
            "correct": "3"
        },
        {
            "title": "Keyword Only",
            "difficulty": "Advanced",
            "code": "def f(*, a):\n    return a\nprint(f(a=1))",
            "options": ["1", "Error", "None", "(1,)"],
            "correct": "1"
        },
        {
            "title": "Generator Basic",
            "difficulty": "Advanced",
            "code": "def g():\n    yield 1\n    yield 2\nx = g()\nprint(next(x) + next(x))",
            "options": ["12", "3", "Error", "1"],
            "correct": "3"
        },
        {
            "title": "Dictionary Comprehension",
            "difficulty": "Advanced",
            "code": "d = {i: i*2 for i in range(2)}\nprint(d[1])",
            "options": ["0", "1", "2", "Error"],
            "correct": "2"
        },
        {
            "title": "Recursion Depth",
            "difficulty": "Advanced",
            "code": "def count(n):\n    if n == 0: return 0\n    return 1 + count(n-1)\nprint(count(3))",
            "options": ["0", "1", "3", "Error"],
            "correct": "3"
        },
        {
            "title": "Class Variable",
            "difficulty": "Advanced",
            "code": "class A:\n    v = 1\na = A()\na.v = 2\nprint(A.v)",
            "options": ["1", "2", "None", "Error"],
            "correct": "1"
        },
        {
            "title": "Decorated Function",
            "difficulty": "Advanced",
            "code": "def dec(f):\n    return lambda: f() + '!'\n@dec\ndef greet():\n    return 'Hi'\nprint(greet())",
            "options": ["Hi", "Hi!", "Error", "None"],
            "correct": "Hi!"
        },
        {
            "title": "Unpacking Args",
            "difficulty": "Advanced",
            "code": "def f(a, b, c):\n    return a+b+c\nnums = [1, 2, 3]\nprint(f(*nums))",
            "options": ["6", "123", "Error", "[1, 2, 3]"],
            "correct": "6"
        },
        {
            "title": "Try-Finally Return",
            "difficulty": "Advanced",
            "code": "def f():\n    try:\n        return 1\n    finally:\n        return 2\nprint(f())",
            "options": ["1", "2", "Error", "None"],
            "correct": "2"
        },
        {
            "title": "Mutable Default",
            "difficulty": "Advanced",
            "code": "def f(a=[]):\n    a.append(1)\n    return len(a)\nf()\nprint(f())",
            "options": ["1", "2", "Error", "0"],
            "correct": "2"
        },
        {
            "title": "Map Function",
            "difficulty": "Advanced",
            "code": "x = map(lambda i: i*2, [1, 2])\nprint(list(x))",
            "options": ["[1, 2]", "[2, 4]", "Error", "[1, 2, 1, 2]"],
            "correct": "[2, 4]"
        },
        {
            "title": "Any/All Logic",
            "difficulty": "Advanced",
            "code": "print(any([False, 0, '']))",
            "options": ["True", "False", "None", "Error"],
            "correct": "False"
        },
        {
            "title": "Global Keyword",
            "difficulty": "Advanced",
            "code": "x = 1\ndef f():\n    global x\n    x = 2\nf()\nprint(x)",
            "options": ["1", "2", "None", "Error"],
            "correct": "2"
        },
        {
            "title": "Ternary Operator",
            "difficulty": "Advanced",
            "code": "x = 10\ny = 5 if x > 20 else 2\nprint(y)",
            "options": ["10", "5", "2", "Error"],
            "correct": "2"
        }
    ]

    # Prepare data with metadata
    now = datetime.datetime.utcnow().isoformat()
    for c in challenges:
        c["created_at"] = now
        c["type"] = "prediction"
        c["reward"] = "30 XP" if c["difficulty"] == "Beginner" else "60 XP" if c["difficulty"] == "Intermediate" else "100 XP"

    try:
        # Insert challenges
        result = collection.insert_many(challenges)
        print(f"Successfully seeded {len(result.inserted_ids)} code challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_code_predictions()
