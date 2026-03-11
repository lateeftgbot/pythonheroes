import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_extra_intermediate():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    challenges = [
        {"title": "List Comp with Logic", "difficulty": "Intermediate", "code": "x = [i for i in range(5) if i % 2 == 0]\nprint(x)", "options": ["[0, 2, 4]", "[1, 3]", "[0, 1, 2, 3, 4]", "Error"], "correct": "[0, 2, 4]"},
        {"title": "Dict Items Loop", "difficulty": "Intermediate", "code": "d = {'a': 1}\nfor k, v in d.items():\n    print(k, v)", "options": ["a 1", "('a', 1)", "a : 1", "Error"], "correct": "a 1"},
        {"title": "Set Difference", "difficulty": "Intermediate", "code": "a = {1, 2, 3}\nb = {2, 4}\nprint(a - b)", "options": ["{1, 3}", "{3}", "{1, 3, 4}", "Error"], "correct": "{1, 3}"},
        {"title": "Sorted with Key", "difficulty": "Intermediate", "code": "words = ['hi', 'hello', 'a']\nprint(sorted(words, key=len)[0])", "options": ["hi", "hello", "a", "Error"], "correct": "a"},
        {"title": "F-string Logic", "difficulty": "Intermediate", "code": "x = 10\nprint(f'{x // 3}')", "options": ["3", "3.33", "x // 3", "Error"], "correct": "3"},
        {"title": "Nested List Unpacking", "difficulty": "Intermediate", "code": "a, (b, c) = [1, [2, 3]]\nprint(b + c)", "options": ["5", "3", "2", "Error"], "correct": "5"},
        {"title": "Map with Lambda", "difficulty": "Intermediate", "code": "x = list(map(lambda n: n*n, [1, 2]))\nprint(x)", "options": ["[1, 2]", "[1, 4]", "[2, 4]", "Error"], "correct": "[1, 4]"},
        {"title": "Filter Function", "difficulty": "Intermediate", "code": "x = list(filter(lambda n: n > 0, [-1, 1]))\nprint(x)", "options": ["[-1]", "[1]", "[]", "Error"], "correct": "[1]"},
        {"title": "String Join", "difficulty": "Intermediate", "code": "print('-'.join(['a', 'b']))", "options": ["a-b", "-ab", "a b", "Error"], "correct": "a-b"},
        {"title": "Any on Mixed", "difficulty": "Intermediate", "code": "print(any([0, '', False, 1]))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "All on Mixed", "difficulty": "Intermediate", "code": "print(all([1, 'a', []]))", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Dict Default Get", "difficulty": "Intermediate", "code": "d = {'x': 1}\nprint(d.get('y', 0) + d['x'])", "options": ["1", "0", "2", "Error"], "correct": "1"},
        {"title": "Zip and Dict", "difficulty": "Intermediate", "code": "keys = ['a', 'b']\nvals = [1, 2]\nprint(dict(zip(keys, vals))['a'])", "options": ["1", "2", "a", "Error"], "correct": "1"},
        {"title": "Global Modify", "difficulty": "Intermediate", "code": "n = 1\ndef f():\n    global n\n    n += 1\nf()\nprint(n)", "options": ["1", "2", "None", "Error"], "correct": "2"},
        {"title": "Lambda Multi-arg", "difficulty": "Intermediate", "code": "f = lambda x, y: x if x > y else y\nprint(f(3, 5))", "options": ["3", "5", "x", "Error"], "correct": "5"},
        {"title": "List Slice Reverse", "difficulty": "Intermediate", "code": "a = [1, 2, 3]\nprint(a[::-1])", "options": ["[3, 2, 1]", "[1, 2, 3]", "[1]", "Error"], "correct": "[3, 2, 1]"},
        {"title": "String Find", "difficulty": "Intermediate", "code": "print('hello'.find('l'))", "options": ["2", "3", "1", "Error"], "correct": "2"},
        {"title": "Nested Comp", "difficulty": "Intermediate", "code": "x = [i*j for i in [1] for j in [2, 3]]\nprint(x)", "options": ["[2, 3]", "[1, 2, 3]", "[[2, 3]]", "Error"], "correct": "[2, 3]"},
        {"title": "Tuple as Key", "difficulty": "Intermediate", "code": "d = {(1, 2): 'a'}\nprint(d[(1, 2)])", "options": ["a", "1", "2", "Error"], "correct": "a"},
        {"title": "String Count", "difficulty": "Intermediate", "code": "print('banana'.count('a'))", "options": ["3", "2", "1", "Error"], "correct": "3"},
        {"title": "Set Union", "difficulty": "Intermediate", "code": "a = {1}\nb = {2}\nprint(len(a | b))", "options": ["1", "2", "3", "0"], "correct": "2"},
        {"title": "Enumerate Start", "difficulty": "Intermediate", "code": "for i, v in enumerate(['a'], 1):\n    print(i)", "options": ["0", "1", "a", "Error"], "correct": "1"},
        {"title": "Round with Precision", "difficulty": "Intermediate", "code": "print(round(2.567, 1))", "options": ["2.5", "2.6", "2.57", "3.0"], "correct": "2.6"},
        {"title": "For-Else Basic", "difficulty": "Intermediate", "code": "for i in []:\n    print('A')\nelse:\n    print('B')", "options": ["A", "B", "AB", "None"], "correct": "B"},
        {"title": "String IsDigit", "difficulty": "Intermediate", "code": "print('123'.isdigit())", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Min of Dict", "difficulty": "Intermediate", "code": "d = {'a': 10, 'b': 5}\nprint(min(d))", "options": ["a", "b", "5", "10"], "correct": "a"},
        {"title": "Try-Except Logic", "difficulty": "Intermediate", "code": "try:\n    x = 1/0\nexcept:\n    x = 0\nprint(x)", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "List Comprehension Str", "difficulty": "Intermediate", "code": "x = [s.upper() for s in ['a', 'b']]\nprint(x)", "options": ["['A', 'B']", "['a', 'b']", "AB", "Error"], "correct": "['A', 'B']"},
        {"title": "Bool Int Math", "difficulty": "Intermediate", "code": "print(True + True + False)", "options": ["2", "1", "0", "True"], "correct": "2"},
        {"title": "Dictionary Pop", "difficulty": "Intermediate", "code": "d = {'a': 1}\nx = d.pop('a')\nprint(x)", "options": ["1", "a", "{'a': 1}", "Error"], "correct": "1"},
        {"title": "Tuple Count", "difficulty": "Intermediate", "code": "t = (1, 1, 2)\nprint(t.count(1))", "options": ["1", "2", "3", "0"], "correct": "2"},
        {"title": "Set Intersection Method", "difficulty": "Intermediate", "code": "a = {1, 2}\nprint(a.intersection({2, 3}))", "options": ["{2}", "{1, 2, 3}", "{1}", "Error"], "correct": "{2}"},
        {"title": "Abs Negative Float", "difficulty": "Intermediate", "code": "print(abs(-5.5))", "options": ["5.5", "5", "-5.5", "Error"], "correct": "5.5"},
        {"title": "Sorted String", "difficulty": "Intermediate", "code": "print(''.join(sorted('bac')))", "options": ["abc", "bac", "cab", "Error"], "correct": "abc"},
        {"title": "List Remove", "difficulty": "Intermediate", "code": "a = [1, 2, 1]\na.remove(1)\nprint(a)", "options": ["[2, 1]", "[1, 2]", "[2]", "Error"], "correct": "[2, 1]"},
        {"title": "Binary Conversion", "difficulty": "Intermediate", "code": "print(bin(3))", "options": ["0b11", "11", "0b10", "3"], "correct": "0b11"},
        {"title": "Hex Conversion", "difficulty": "Intermediate", "code": "print(hex(10))", "options": ["0xa", "a", "0x10", "10"], "correct": "0xa"},
        {"title": "Dict Comprehension Sq", "difficulty": "Intermediate", "code": "d = {i: i*i for i in [1, 2]}\nprint(d[2])", "options": ["2", "4", "1", "Error"], "correct": "4"},
        {"title": "String Strip", "difficulty": "Intermediate", "code": "print(' hi '.strip())", "options": ["hi", " hi", "hi ", "Error"], "correct": "hi"},
        {"title": "Recursive Sum", "difficulty": "Intermediate", "code": "def s(n):\n    if n == 0: return 0\n    return n + s(n-1)\nprint(s(3))", "options": ["3", "6", "0", "Error"], "correct": "6"},
        {"title": "Function as Object", "difficulty": "Intermediate", "code": "def f(x): return x+1\ng = f\nprint(g(10))", "options": ["10", "11", "Error", "None"], "correct": "11"},
        {"title": "Namespace Basic", "difficulty": "Intermediate", "code": "x = 1\ndef f():\n    x = 2\n    return x\nprint(f() + x)", "options": ["2", "3", "4", "1"], "correct": "3"},
        {"title": "List of Tuples Sort", "difficulty": "Intermediate", "code": "a = [(1, 2), (0, 3)]\nprint(sorted(a)[0][0])", "options": ["0", "1", "2", "3"], "correct": "0"},
        {"title": "Zip Result Unpack", "difficulty": "Intermediate", "code": "a, b = zip(*[(1, 2), (3, 4)])\nprint(a)", "options": ["(1, 3)", "(1, 2)", "[1, 2]", "Error"], "correct": "(1, 3)"},
        {"title": "String Startswith", "difficulty": "Intermediate", "code": "print('Python'.startswith('Py'))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "String Format Index", "difficulty": "Intermediate", "code": "print('{1} {0}'.format('a', 'b'))", "options": ["a b", "b a", "Error", "0 1"], "correct": "b a"},
        {"title": "Deep List Access", "difficulty": "Intermediate", "code": "a = [[1, 2], [3, 4]]\nprint(a[1][0])", "options": ["1", "3", "4", "2"], "correct": "3"},
        {"title": "Set Add Item", "difficulty": "Intermediate", "code": "s = {1}\ns.add(1)\nprint(len(s))", "options": ["1", "2", "0", "Error"], "correct": "1"},
        {"title": "String Title", "difficulty": "Intermediate", "code": "print('hi there'.title())", "options": ["Hi there", "Hi There", "HI THERE", "Error"], "correct": "Hi There"},
        {"title": "Boolean Inversion", "difficulty": "Intermediate", "code": "print(not not True)", "options": ["True", "False", "None", "Error"], "correct": "True"}
    ]

    # Prepare data
    now = datetime.datetime.utcnow().isoformat()
    for c in challenges:
        c["created_at"] = now
        c["type"] = "prediction"
        c["reward"] = "60 XP"

    try:
        result = collection.insert_many(challenges)
        print(f"Successfully seeded {len(result.inserted_ids)} EXTRA intermediate code challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_extra_intermediate()
