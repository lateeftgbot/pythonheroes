import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_extra_basics():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    extra_challenges = [
        {"title": "Order of Operations", "difficulty": "Beginner", "code": "print(3 + 4 * 2)", "options": ["14", "11", "24", "7"], "correct": "11"},
        {"title": "Basic Slicing", "difficulty": "Beginner", "code": "print('Python'[:4])", "options": ["Pyth", "Pytho", "Py", "Error"], "correct": "Pyth"},
        {"title": "Integer Division", "difficulty": "Beginner", "code": "print(15 // 4)", "options": ["3", "3.75", "4", "0"], "correct": "3"},
        {"title": "Power Operator", "difficulty": "Beginner", "code": "print(2**4)", "options": ["8", "16", "32", "4"], "correct": "16"},
        {"title": "String Spacing", "difficulty": "Beginner", "code": "print(' ' * 3)", "options": ["   ", "''", "Error", "3"], "correct": "   "},
        {"title": "Subtract and Assign", "difficulty": "Beginner", "code": "x = 10\nx -= 3\nprint(x)", "options": ["10", "13", "7", "3"], "correct": "7"},
        {"title": "Modulo Result", "difficulty": "Beginner", "code": "print(10 % 4)", "options": ["2", "2.5", "0", "4"], "correct": "2"},
        {"title": "Length of Combined Lists", "difficulty": "Beginner", "code": "a = [1, 2]\nb = [3, 4]\nprint(len(a + b))", "options": ["2", "4", "2,2", "Error"], "correct": "4"},
        {"title": "Case Sensitivity", "difficulty": "Beginner", "code": "print('apple' == 'Apple')", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Logical And", "difficulty": "Beginner", "code": "print(10 > 5 and 3 < 1)", "options": ["True", "False", "10", "1"], "correct": "False"},
        {"title": "Logical Not", "difficulty": "Beginner", "code": "print(not (5 == 5))", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "String Appending", "difficulty": "Beginner", "code": "x = '123'\nprint(x + '4')", "options": ["127", "1234", "123 4", "Error"], "correct": "1234"},
        {"title": "List Access", "difficulty": "Beginner", "code": "a = [10, 20, 30, 40]\nprint(a[2])", "options": ["10", "20", "30", "40"], "correct": "30"},
        {"title": "Type Casting Float", "difficulty": "Beginner", "code": "print(int(5.7))", "options": ["5", "6", "5.7", "Error"], "correct": "5"},
        {"title": "Lowercase Method", "difficulty": "Beginner", "code": "s = 'Hello'\nprint(s.lower())", "options": ["Hello", "hello", "HELLO", "Error"], "correct": "hello"},
        {"title": "Nested List Length", "difficulty": "Beginner", "code": "print(len([1, [2, 3]]))", "options": ["1", "2", "3", "Error"], "correct": "2"},
        {"title": "Truthiness", "difficulty": "Beginner", "code": "x = 5\nprint(bool(x))", "options": ["True", "False", "5", "None"], "correct": "True"},
        {"title": "String Repeating", "difficulty": "Beginner", "code": "print('abc' * 2)", "options": ["abc2", "abcabc", "aabbcc", "Error"], "correct": "abcabc"},
        {"title": "Append Item", "difficulty": "Beginner", "code": "a = [1, 2]\na.append(a[0])\nprint(a)", "options": ["[1, 2]", "[1, 2, 1]", "[1, 2, 2]", "[1, 1, 2]"], "correct": "[1, 2, 1]"},
        {"title": "Float Division", "difficulty": "Beginner", "code": "print(7 / 2)", "options": ["3", "3.5", "3.0", "4"], "correct": "3.5"},
        {"title": "Inequality", "difficulty": "Beginner", "code": "x = 100\nprint(x != 100)", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Middle Slice", "difficulty": "Beginner", "code": "print('banana'[1:3])", "options": ["ba", "an", "na", "ana"], "correct": "an"},
        {"title": "Tuple Type Check", "difficulty": "Beginner", "code": "a = (1,)\nprint(type(a) == tuple)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Dictionary Growth", "difficulty": "Beginner", "code": "d = {'x': 10}\nd['y'] = 20\nprint(len(d))", "options": ["1", "2", "10", "20"], "correct": "2"},
        {"title": "Max in List", "difficulty": "Beginner", "code": "print(max([1, 10, 2]))", "options": ["1", "10", "2", "Error"], "correct": "10"},
        {"title": "Simple Choice", "difficulty": "Beginner", "code": "x = 5\nif x < 5: print('A')\nelse: print('B')", "options": ["A", "B", "5", "Error"], "correct": "B"},
        {"title": "Range Summation", "difficulty": "Beginner", "code": "sum = 0\nfor i in range(3): sum += i\nprint(sum)", "options": ["0", "3", "6", "2"], "correct": "3"},
        {"title": "Stringify Float", "difficulty": "Beginner", "code": "print(str(5.0))", "options": ["5", "5.0", "Error", "None"], "correct": "5.0"},
        {"title": "Pop Last Item", "difficulty": "Beginner", "code": "a = [1, 2, 3]\nprint(a.pop())", "options": ["1", "2", "3", "None"], "correct": "3"},
        {"title": "Substring Search", "difficulty": "Beginner", "code": "print('p' in 'apple')", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Floor and Remainder", "difficulty": "Beginner", "code": "print(10 // 3 + 10 % 3)", "options": ["4", "3", "1", "13"], "correct": "4"},
        {"title": "Variable Linkage", "difficulty": "Beginner", "code": "x = 10\ny = x\nx = 5\nprint(y)", "options": ["10", "5", "None", "Error"], "correct": "10"},
        {"title": "Character Replace", "difficulty": "Beginner", "code": "print('cool'.replace('o', 'a'))", "options": ["coal", "caal", "cool", "cala"], "correct": "caal"},
        {"title": "Index Override", "difficulty": "Beginner", "code": "a = [1, 2]\na[1] = 3\nprint(a)", "options": ["[1, 2]", "[1, 3]", "[3, 2]", "Error"], "correct": "[1, 3]"},
        {"title": "Math from String", "difficulty": "Beginner", "code": "print(float('2.5') * 2)", "options": ["5", "5.0", "2.52.5", "Error"], "correct": "5.0"},
        {"title": "Whitespace Len", "difficulty": "Beginner", "code": "print(len(' '))", "options": ["0", "1", "None", "Error"], "correct": "1"},
        {"title": "Logical Or", "difficulty": "Beginner", "code": "x = True\ny = False\nprint(x or y)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "CSV Split", "difficulty": "Beginner", "code": "print('1,2,3'.split(','))", "options": ["1,2,3", "['1', '2', '3']", "[1, 2, 3]", "Error"], "correct": "['1', '2', '3']"},
        {"title": "List Extension", "difficulty": "Beginner", "code": "a = [1]\na.extend([20])\nprint(len(a))", "options": ["1", "2", "21", "Error"], "correct": "2"},
        {"title": "Round Logic", "difficulty": "Beginner", "code": "print(round(2.4))", "options": ["2", "3", "2.4", "2.0"], "correct": "2"},
        {"title": "Simple Multiply", "difficulty": "Beginner", "code": "x = 2\nprint(x * 3 + 4)", "options": ["10", "14", "6", "Error"], "correct": "10"},
        {"title": "String Plus Int", "difficulty": "Beginner", "code": "print('hi' + str(5))", "options": ["hi5", "hi 5", "Error", "None"], "correct": "hi5"},
        {"title": "Index Slicing", "difficulty": "Beginner", "code": "a = [1, 2, 3]\nprint(a[1:2])", "options": ["[1]", "[2]", "[1, 2]", "[2, 3]"], "correct": "[2]"},
        {"title": "Absolute Value", "difficulty": "Beginner", "code": "print(abs(-10))", "options": ["-10", "10", "0", "None"], "correct": "10"},
        {"title": "Combined Logic", "difficulty": "Beginner", "code": "x = 5\nprint(x == 5 or x < 2)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Uppercase Method", "difficulty": "Beginner", "code": "print('abc'.upper())", "options": ["abc", "ABC", "Abc", "Error"], "correct": "ABC"},
        {"title": "List Multiplication", "difficulty": "Beginner", "code": "a = [1, 2]\nprint(a * 2)", "options": ["[2, 4]", "[1, 2, 1, 2]", "[1, 2, 2]", "Error"], "correct": "[1, 2, 1, 2]"},
        {"title": "Division Result Type", "difficulty": "Beginner", "code": "x = 10\nprint(x / 1)", "options": ["10", "10.0", "1", "Error"], "correct": "10.0"},
        {"title": "Reverse Index", "difficulty": "Beginner", "code": "print('test'[-1])", "options": ["t", "e", "s", "Error"], "correct": "t"},
        {"title": "None Test", "difficulty": "Beginner", "code": "x = None\nprint(x is None)", "options": ["True", "False", "None", "Error"], "correct": "True"}
    ]

    # Prepare data
    now = datetime.datetime.utcnow().isoformat()
    for c in extra_challenges:
        c["created_at"] = now
        c["type"] = "prediction"
        c["reward"] = "30 XP"

    try:
        result = collection.insert_many(extra_challenges)
        print(f"Successfully seeded {len(result.inserted_ids)} EXTRA basic code challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_extra_basics()
