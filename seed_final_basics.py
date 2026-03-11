import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_final_basics():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    final_basics = [
        {"title": "Multi Add", "difficulty": "Beginner", "code": "print(1 + 2 + 3)", "options": ["3", "6", "123", "Error"], "correct": "6"},
        {"title": "String Head", "difficulty": "Beginner", "code": "print('Hello'[0])", "options": ["H", "e", "l", "Error"], "correct": "H"},
        {"title": "Small List Len", "difficulty": "Beginner", "code": "print(len([]))", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "Float Sum", "difficulty": "Beginner", "code": "print(1.5 + 0.5)", "options": ["2.0", "1.50.5", "2", "Error"], "correct": "2.0"},
        {"title": "Simple Or True", "difficulty": "Beginner", "code": "print(True or False)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Simple And False", "difficulty": "Beginner", "code": "print(True and False)", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Negation", "difficulty": "Beginner", "code": "print(not True)", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Subtraction Basic", "difficulty": "Beginner", "code": "print(10 - 7)", "options": ["3", "17", "7", "Error"], "correct": "3"},
        {"title": "Multiply Basic", "difficulty": "Beginner", "code": "print(3 * 3)", "options": ["6", "9", "33", "Error"], "correct": "9"},
        {"title": "Division Basic", "difficulty": "Beginner", "code": "print(8 / 2)", "options": ["4", "4.0", "16", "Error"], "correct": "4.0"},
        {"title": "Floor Div Basic", "difficulty": "Beginner", "code": "print(10 // 3)", "options": ["3", "3.33", "4", "Error"], "correct": "3"},
        {"title": "Modulo Five", "difficulty": "Beginner", "code": "print(5 % 2)", "options": ["0", "1", "2.5", "Error"], "correct": "1"},
        {"title": "Power Two", "difficulty": "Beginner", "code": "print(2**3)", "options": ["6", "8", "5", "Error"], "correct": "8"},
        {"title": "Variable Start", "difficulty": "Beginner", "code": "count = 0\nprint(count)", "options": ["0", "1", "count", "Error"], "correct": "0"},
        {"title": "Variable Add", "difficulty": "Beginner", "code": "x = 5\ny = x + 1\nprint(y)", "options": ["5", "6", "x+1", "Error"], "correct": "6"},
        {"title": "String Double", "difficulty": "Beginner", "code": "print('Hi' * 2)", "options": ["HiHi", "Hi2", "Hi Hi", "Error"], "correct": "HiHi"},
        {"title": "String Len Six", "difficulty": "Beginner", "code": "print(len('Python'))", "options": ["5", "6", "7", "Error"], "correct": "6"},
        {"title": "List One Two", "difficulty": "Beginner", "code": "a = [1, 2]\nprint(a[1])", "options": ["1", "2", "3", "Error"], "correct": "2"},
        {"title": "List Append Basic", "difficulty": "Beginner", "code": "a = [1]\na.append(2)\nprint(len(a))", "options": ["1", "2", "3", "Error"], "correct": "2"},
        {"title": "List Index First", "difficulty": "Beginner", "code": "a = [10, 20]\nprint(a[0])", "options": ["10", "20", "0", "IndexError"], "correct": "10"},
        {"title": "If One", "difficulty": "Beginner", "code": "x = 1\nif x == 1: print('A')\nelse: print('B')", "options": ["A", "B", "1", "Error"], "correct": "A"},
        {"title": "If Two", "difficulty": "Beginner", "code": "x = 2\nif x == 1: print('A')\nelse: print('B')", "options": ["A", "B", "2", "Error"], "correct": "B"},
        {"title": "Range Three", "difficulty": "Beginner", "code": "print(list(range(3)))", "options": ["[1, 2, 3]", "[0, 1, 2]", "[0, 1, 2, 3]", "Error"], "correct": "[0, 1, 2]"},
        {"title": "String Empty", "difficulty": "Beginner", "code": "print(len(''))", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "Space String", "difficulty": "Beginner", "code": "print(len(' '))", "options": ["0", "1", "None", "Error"], "correct": "1"},
        {"title": "Int Conv", "difficulty": "Beginner", "code": "print(int(3.9))", "options": ["3", "4", "3.9", "Error"], "correct": "3"},
        {"title": "Float Conv", "difficulty": "Beginner", "code": "print(float(2))", "options": ["2", "2.0", "2.5", "Error"], "correct": "2.0"},
        {"title": "Str Conv", "difficulty": "Beginner", "code": "print(str(10))", "options": ["10", "'10'", "Error", "None"], "correct": "10"},
        {"title": "Absolute One", "difficulty": "Beginner", "code": "print(abs(-5))", "options": ["-5", "5", "0", "Error"], "correct": "5"},
        {"title": "Round One", "difficulty": "Beginner", "code": "print(round(1.2))", "options": ["1", "2", "1.2", "Error"], "correct": "1"},
        {"title": "Sum List", "difficulty": "Beginner", "code": "print(sum([1, 2]))", "options": ["1", "2", "3", "Error"], "correct": "3"},
        {"title": "Max Int", "difficulty": "Beginner", "code": "print(max(5, 10))", "options": ["5", "10", "15", "Error"], "correct": "10"},
        {"title": "Min Int", "difficulty": "Beginner", "code": "print(min(5, 10))", "options": ["5", "10", "0", "Error"], "correct": "5"},
        {"title": "In List", "difficulty": "Beginner", "code": "print(1 in [1, 2])", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Not In List", "difficulty": "Beginner", "code": "print(3 not in [1, 2])", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Type Int", "difficulty": "Beginner", "code": "print(type(1) == int)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Type Str", "difficulty": "Beginner", "code": "print(type('a') == str)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "List Slicing One", "difficulty": "Beginner", "code": "a = [1, 2, 3]\nprint(a[0:1])", "options": ["1", "[1]", "[1, 2]", "Error"], "correct": "[1]"},
        {"title": "List Slicing Two", "difficulty": "Beginner", "code": "a = [1, 2, 3]\nprint(a[1:])", "options": ["[1, 2]", "[2, 3]", "[2]", "Error"], "correct": "[2, 3]"},
        {"title": "String Slicing One", "difficulty": "Beginner", "code": "print('abc'[1:2])", "options": ["a", "b", "c", "Error"], "correct": "b"},
        {"title": "String Slicing Two", "difficulty": "Beginner", "code": "print('abc'[:2])", "options": ["a", "ab", "bc", "Error"], "correct": "ab"},
        {"title": "Dict Access", "difficulty": "Beginner", "code": "d = {'a': 1}\nprint(d['a'])", "options": ["a", "1", "d", "Error"], "correct": "1"},
        {"title": "Dict Len", "difficulty": "Beginner", "code": "d = {'a': 1, 'b': 2}\nprint(len(d))", "options": ["1", "2", "4", "Error"], "correct": "2"},
        {"title": "None Test", "difficulty": "Beginner", "code": "x = None\nprint(x is None)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Bool Add One", "difficulty": "Beginner", "code": "print(True + True)", "options": ["1", "2", "TrueTrue", "Error"], "correct": "2"},
        {"title": "String Replace", "difficulty": "Beginner", "code": "print('cat'.replace('c', 'b'))", "options": ["cat", "bat", "ct", "Error"], "correct": "bat"},
        {"title": "String Lower", "difficulty": "Beginner", "code": "print('HI'.lower())", "options": ["HI", "hi", "Hi", "Error"], "correct": "hi"},
        {"title": "String Upper", "difficulty": "Beginner", "code": "print('hi'.upper())", "options": ["hi", "HI", "Hi", "Error"], "correct": "HI"},
        {"title": "List Pop Tail", "difficulty": "Beginner", "code": "a = [1, 2]\nprint(a.pop())", "options": ["1", "2", "None", "Error"], "correct": "2"},
        {"title": "List Pop Head", "difficulty": "Beginner", "code": "a = [1, 2]\nprint(a.pop(0))", "options": ["1", "2", "None", "Error"], "correct": "1"},
        
        # Second batch
        {"title": "Multiply Three", "difficulty": "Beginner", "code": "print(2 * 2 * 2)", "options": ["4", "6", "8", "Error"], "correct": "8"},
        {"title": "String Tail", "difficulty": "Beginner", "code": "print('abc'[-1])", "options": ["a", "b", "c", "Error"], "correct": "c"},
        {"title": "Modulo Zero", "difficulty": "Beginner", "code": "print(10 % 5)", "options": ["0", "1", "2", "Error"], "correct": "0"},
        {"title": "Range One", "difficulty": "Beginner", "code": "print(list(range(1)))", "options": ["[0]", "[1]", "[]", "Error"], "correct": "[0]"},
        {"title": "Variable Swap", "difficulty": "Beginner", "code": "a = 1\nb = 2\na = b\nprint(a)", "options": ["1", "2", "None", "Error"], "correct": "2"},
        {"title": "Simple Plus Equal", "difficulty": "Beginner", "code": "x = 10\nx += 5\nprint(x)", "options": ["10", "15", "5", "Error"], "correct": "15"},
        {"title": "Simple Minus Equal", "difficulty": "Beginner", "code": "x = 10\nx -= 2\nprint(x)", "options": ["10", "8", "12", "Error"], "correct": "8"},
        {"title": "Type List", "difficulty": "Beginner", "code": "print(type([]) == list)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Type Dict", "difficulty": "Beginner", "code": "print(type({}) == dict)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Empty List Addition", "difficulty": "Beginner", "code": "print([] + [1])", "options": ["[]", "[1]", "Error", "None"], "correct": "[1]"},
        {"title": "String Find Pos", "difficulty": "Beginner", "code": "print('abc'.find('b'))", "options": ["0", "1", "2", "-1"], "correct": "1"},
        {"title": "String Count Char", "difficulty": "Beginner", "code": "print('banana'.count('n'))", "options": ["1", "2", "3", "Error"], "correct": "2"},
        {"title": "Tuple Index First", "difficulty": "Beginner", "code": "t = (1, 2)\nprint(t[0])", "options": ["1", "2", "0", "IndexError"], "correct": "1"},
        {"title": "Max String", "difficulty": "Beginner", "code": "print(max('abc'))", "options": ["a", "b", "c", "Error"], "correct": "c"},
        {"title": "Min String", "difficulty": "Beginner", "code": "print(min('abc'))", "options": ["a", "b", "c", "Error"], "correct": "a"},
        {"title": "Sum Float List", "difficulty": "Beginner", "code": "print(sum([1.0, 2.0]))", "options": ["3", "3.0", "Error", "None"], "correct": "3.0"},
        {"title": "Compare Strings", "difficulty": "Beginner", "code": "print('a' < 'b')", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Compare Numbers", "difficulty": "Beginner", "code": "print(10 >= 10)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "List Remove Basic", "difficulty": "Beginner", "code": "a = [1, 2]\na.remove(1)\nprint(a)", "options": ["[1]", "[2]", "[]", "Error"], "correct": "[2]"},
        {"title": "List Clear Simple 2", "difficulty": "Beginner", "code": "a = [1, 2]\na.clear()\nprint(len(a))", "options": ["0", "1", "2", "Error"], "correct": "0"},
        {"title": "Power One", "difficulty": "Beginner", "code": "print(5**1)", "options": ["1", "5", "25", "Error"], "correct": "5"},
        {"title": "Power Zero", "difficulty": "Beginner", "code": "print(5**0)", "options": ["0", "1", "5", "Error"], "correct": "1"},
        {"title": "Floor Div Two", "difficulty": "Beginner", "code": "print(7 // 2)", "options": ["3", "3.5", "4", "Error"], "correct": "3"},
        {"title": "Div Mod Two", "difficulty": "Beginner", "code": "print(10 // 3, 10 % 3)", "options": ["3 1", "3.33 1", "3 0", "Error"], "correct": "3 1"},
        {"title": "String Join Simple", "difficulty": "Beginner", "code": "print('-'.join(['a', 'b']))", "options": ["ab", "a-b", "-ab", "Error"], "correct": "a-b"},
        {"title": "String Split Simple", "difficulty": "Beginner", "code": "print('a b'.split())", "options": ["['a', 'b']", "['a b']", "a,b", "Error"], "correct": "['a', 'b']"},
        {"title": "Range Start Stop", "difficulty": "Beginner", "code": "print(list(range(2, 5)))", "options": ["[2, 3, 4]", "[2, 3, 4, 5]", "[3, 4, 5]", "Error"], "correct": "[2, 3, 4]"},
        {"title": "List Reverse Basic", "difficulty": "Beginner", "code": "a = [1, 2]\na.reverse()\nprint(a)", "options": ["[1, 2]", "[2, 1]", "None", "Error"], "correct": "[2, 1]"},
        {"title": "List Sort Basic", "difficulty": "Beginner", "code": "a = [2, 1]\na.sort()\nprint(a)", "options": ["[1, 2]", "[2, 1]", "None", "Error"], "correct": "[1, 2]"},
        {"title": "Tuple Count Basic", "difficulty": "Beginner", "code": "t = (1, 1, 2)\nprint(t.count(1))", "options": ["1", "2", "3", "0"], "correct": "2"},
        {"title": "Dict Keys List", "difficulty": "Beginner", "code": "d = {'a': 1}\nprint(list(d.keys()))", "options": ["['a']", "[1]", "['a', 1]", "Error"], "correct": "['a']"},
        {"title": "Dict Values List", "difficulty": "Beginner", "code": "d = {'a': 1}\nprint(list(d.values()))", "options": ["['a']", "[1]", "['a', 1]", "Error"], "correct": "[1]"},
        {"title": "Set Add Basic", "difficulty": "Beginner", "code": "s = {1}\ns.add(2)\nprint(len(s))", "options": ["1", "2", "3", "Error"], "correct": "2"},
        {"title": "Set Add Duplicate", "difficulty": "Beginner", "code": "s = {1}\ns.add(1)\nprint(len(s))", "options": ["1", "2", "0", "Error"], "correct": "1"},
        {"title": "Boolean And True", "difficulty": "Beginner", "code": "print(True and True)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Boolean Or False", "difficulty": "Beginner", "code": "print(False or False)", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Math Mix One", "difficulty": "Beginner", "code": "print(2 + 2 * 2)", "options": ["6", "8", "4", "Error"], "correct": "6"},
        {"title": "Math Mix Two", "difficulty": "Beginner", "code": "print((2 + 2) * 2)", "options": ["6", "8", "4", "Error"], "correct": "8"},
        {"title": "Double Negation", "difficulty": "Beginner", "code": "print(not not True)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Variable Multi", "difficulty": "Beginner", "code": "a, b = 1, 2\nprint(a + b)", "options": ["1", "2", "3", "Error"], "correct": "3"},
        {"title": "String Slice Full", "difficulty": "Beginner", "code": "print('abc'[:])", "options": ["a", "b", "c", "abc"], "correct": "abc"},
        {"title": "String Slice One Char", "difficulty": "Beginner", "code": "print('abc'[0:1])", "options": ["a", "ab", "abc", "Error"], "correct": "a"},
        {"title": "In Dictionary", "difficulty": "Beginner", "code": "d = {'a': 1}\nprint('a' in d)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "In Dictionary Value", "difficulty": "Beginner", "code": "d = {'a': 1}\nprint(1 in d)", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Int to Bool", "difficulty": "Beginner", "code": "print(bool(1))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Zero to Bool", "difficulty": "Beginner", "code": "print(bool(0))", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Str to Bool", "difficulty": "Beginner", "code": "print(bool('a'))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Empty to Bool", "difficulty": "Beginner", "code": "print(bool(''))", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Round Even", "difficulty": "Beginner", "code": "print(round(2.5))", "options": ["2", "3", "2.5", "Error"], "correct": "2"},
        {"title": "Round Odd", "difficulty": "Beginner", "code": "print(round(3.5))", "options": ["3", "4", "3.5", "Error"], "correct": "4"}
    ]

    # Prepare data
    now = datetime.datetime.utcnow().isoformat()
    for c in final_basics:
        c["created_at"] = now
        c["type"] = "prediction"
        c["reward"] = "30 XP"

    try:
        result = collection.insert_many(final_basics)
        print(f"Successfully seeded {len(result.inserted_ids)} FINAL basic code challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_final_basics()
