import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_more_basics():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    simple_basics = [
        {"title": "Simple Addition", "difficulty": "Beginner", "code": "print(10 + 20)", "options": ["10", "20", "30", "1020"], "correct": "30"},
        {"title": "Variable Print", "difficulty": "Beginner", "code": "name = 'Lative'\nprint(name)", "options": ["name", "Lative", "Lativectors", "Error"], "correct": "Lative"},
        {"title": "Simple List Access", "difficulty": "Beginner", "code": "fruits = ['apple', 'pear']\nprint(fruits[0])", "options": ["apple", "pear", "0", "IndexError"], "correct": "apple"},
        {"title": "Int to String", "difficulty": "Beginner", "code": "x = 5\nprint(str(x))", "options": ["5", "'5'", "Error", "None"], "correct": "5"},
        {"title": "Simple Subtraction", "difficulty": "Beginner", "code": "print(100 - 50)", "options": ["100", "50", "150", "0"], "correct": "50"},
        {"title": "Boolean True", "difficulty": "Beginner", "code": "print(True)", "options": ["True", "False", "1", "0"], "correct": "True"},
        {"title": "Boolean False", "difficulty": "Beginner", "code": "print(False)", "options": ["True", "False", "1", "0"], "correct": "False"},
        {"title": "Simple Multiplication", "difficulty": "Beginner", "code": "print(5 * 4)", "options": ["9", "20", "25", "54"], "correct": "20"},
        {"title": "Variable Re-assign", "difficulty": "Beginner", "code": "x = 1\nx = 2\nprint(x)", "options": ["1", "2", "3", "None"], "correct": "2"},
        {"title": "String Concatenation", "difficulty": "Beginner", "code": "print('Py' + 'thon')", "options": ["Python", "Py thon", "Py+thon", "Error"], "correct": "Python"},
        {"title": "List Length One", "difficulty": "Beginner", "code": "a = [10]\nprint(len(a))", "options": ["0", "1", "10", "Error"], "correct": "1"},
        {"title": "List Index Last", "difficulty": "Beginner", "code": "a = [1, 2, 3]\nprint(a[2])", "options": ["1", "2", "3", "Error"], "correct": "3"},
        {"title": "Simple If True", "difficulty": "Beginner", "code": "if True:\n    print('Yes')\nelse:\n    print('No')", "options": ["Yes", "No", "True", "Error"], "correct": "Yes"},
        {"title": "Simple If False", "difficulty": "Beginner", "code": "if False:\n    print('Yes')\nelse:\n    print('No')", "options": ["Yes", "No", "False", "Error"], "correct": "No"},
        {"title": "Loop Triple", "difficulty": "Beginner", "code": "for i in [1, 1, 1]:\n    print('A')", "options": ["A", "AA", "AAA", "3"], "correct": "AAA"}, # Output simulation: AAA in separate lines usually but here we mean total prints
        {"title": "String to Int", "difficulty": "Beginner", "code": "print(int('100'))", "options": ["100", "'100'", "Error", "1"], "correct": "100"},
        {"title": "Type of String", "difficulty": "Beginner", "code": "print(type('hi') == str)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Type of Int", "difficulty": "Beginner", "code": "print(type(5) == int)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "List Index Error Check", "difficulty": "Beginner", "code": "a = [1]\ntry:\n    print(a[5])\nexcept:\n    print('E')", "options": ["1", "5", "E", "None"], "correct": "E"},
        {"title": "Simple Comparison", "difficulty": "Beginner", "code": "print(5 > 2)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Simple Equality", "difficulty": "Beginner", "code": "print(10 == 10)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Simple Inequality", "difficulty": "Beginner", "code": "print(10 != 5)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "String Double Quote", "difficulty": "Beginner", "code": "print(\"Hi\")", "options": ["Hi", "\"Hi\"", "Error", "None"], "correct": "Hi"},
        {"title": "String Single Quote", "difficulty": "Beginner", "code": "print('Hi')", "options": ["Hi", "'Hi'", "Error", "None"], "correct": "Hi"},
        {"title": "List Multi Items", "difficulty": "Beginner", "code": "a = [1, 2, 3]\nprint(len(a))", "options": ["1", "2", "3", "Error"], "correct": "3"},
        {"title": "Dict Value Access", "difficulty": "Beginner", "code": "d = {'key': 'val'}\nprint(d['key'])", "options": ["key", "val", "{'key': 'val'}", "Error"], "correct": "val"},
        {"title": "None Check", "difficulty": "Beginner", "code": "x = None\nprint(x)", "options": ["None", "x", "0", "Error"], "correct": "None"},
        {"title": "Empty String Length", "difficulty": "Beginner", "code": "print(len(''))", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "Simple Increment", "difficulty": "Beginner", "code": "x = 0\nx += 1\nprint(x)", "options": ["0", "1", "2", "Error"], "correct": "1"},
        {"title": "Simple Decrement", "difficulty": "Beginner", "code": "x = 10\nx -= 1\nprint(x)", "options": ["10", "9", "11", "Error"], "correct": "9"},
        {"title": "String Multiplication Basic", "difficulty": "Beginner", "code": "print('w' * 2)", "options": ["w", "ww", "w2", "Error"], "correct": "ww"},
        {"title": "Floor Power", "difficulty": "Beginner", "code": "print(3**2)", "options": ["6", "9", "5", "Error"], "correct": "9"},
        {"title": "List Clear Simple", "difficulty": "Beginner", "code": "a = [1]\na = []\nprint(len(a))", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "Print Multiple", "difficulty": "Beginner", "code": "print(1, 2)", "options": ["1 2", "12", "1, 2", "Error"], "correct": "1 2"},
        {"title": "Variable Math", "difficulty": "Beginner", "code": "a = 2\nb = 3\nprint(a * b)", "options": ["5", "6", "23", "Error"], "correct": "6"},
        {"title": "String Upper Case", "difficulty": "Beginner", "code": "s = 'ok'\nprint(s.upper())", "options": ["ok", "Ok", "OK", "Error"], "correct": "OK"},
        {"title": "List Index 1", "difficulty": "Beginner", "code": "a = ['x', 'y', 'z']\nprint(a[1])", "options": ["x", "y", "z", "Error"], "correct": "y"},
        {"title": "Simple If Not", "difficulty": "Beginner", "code": "if not False:\n    print('True')\nelse:\n    print('False')", "options": ["True", "False", "not False", "Error"], "correct": "True"},
        {"title": "Modulo Two", "difficulty": "Beginner", "code": "print(4 % 2)", "options": ["0", "1", "2", "Error"], "correct": "0"},
        {"title": "Modulo Two Odd", "difficulty": "Beginner", "code": "print(5 % 2)", "options": ["0", "1", "2", "Error"], "correct": "1"},
        {"title": "Parentheses Math", "difficulty": "Beginner", "code": "print((2 + 2) * 2)", "options": ["6", "8", "4", "Error"], "correct": "8"},
        {"title": "String Index Zero", "difficulty": "Beginner", "code": "s = 'abc'\nprint(s[0])", "options": ["a", "b", "c", "Error"], "correct": "a"},
        {"title": "Float Basics", "difficulty": "Beginner", "code": "print(1.0 + 1.0)", "options": ["2", "2.0", "1.01.0", "Error"], "correct": "2.0"},
        {"title": "Int to Float", "difficulty": "Beginner", "code": "print(float(5))", "options": ["5", "5.0", "5.5", "Error"], "correct": "5.0"},
        {"title": "List Slicing Start", "difficulty": "Beginner", "code": "a = [1, 2, 3]\nprint(a[:1])", "options": ["[1]", "[1, 2]", "[2]", "Error"], "correct": "[1]"},
        {"title": "String Slicing End", "difficulty": "Beginner", "code": "s = 'abcd'\nprint(s[2:])", "options": ["ab", "cd", "bc", "Error"], "correct": "cd"},
        {"title": "In List Basic", "difficulty": "Beginner", "code": "print(1 in [1, 2])", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Not In List Basic", "difficulty": "Beginner", "code": "print(3 not in [1, 2])", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Max Int Basic", "difficulty": "Beginner", "code": "print(max(10, 20))", "options": ["10", "20", "None", "Error"], "correct": "20"},
        {"title": "Min Int Basic", "difficulty": "Beginner", "code": "print(min(1, 2, 3))", "options": ["1", "2", "3", "Error"], "correct": "1"}
    ]

    # Prepare data
    now = datetime.datetime.utcnow().isoformat()
    for c in simple_basics:
        c["created_at"] = now
        c["type"] = "prediction"
        c["reward"] = "30 XP"

    try:
        result = collection.insert_many(simple_basics)
        print(f"Successfully seeded {len(result.inserted_ids)} MORE SIMPLE basic code challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_more_basics()
