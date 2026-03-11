import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_even_more_intermediate():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    extra_intermediate = [
        {"title": "Filtered List Comp", "difficulty": "Intermediate", "code": "x = [n for n in range(10) if n % 3 == 0]\nprint(x)", "options": ["[0, 3, 6, 9]", "[3, 6, 9]", "[0, 3, 6]", "Error"], "correct": "[0, 3, 6, 9]"},
        {"title": "Dictionary Keys Type", "difficulty": "Intermediate", "code": "d = {1: 'a', '1': 'b'}\nprint(len(d))", "options": ["1", "2", "Error", "None"], "correct": "2"},
        {"title": "Set Removal", "difficulty": "Intermediate", "code": "s = {1, 2, 3}\ns.discard(4)\nprint(len(s))", "options": ["2", "3", "Error", "None"], "correct": "3"},
        {"title": "String IsNumeric", "difficulty": "Intermediate", "code": "print('1.5'.isnumeric())", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Sorted Descending", "difficulty": "Intermediate", "code": "a = [1, 3, 2]\nprint(sorted(a, reverse=True))", "options": ["[3, 2, 1]", "[1, 2, 3]", "[3, 1, 2]", "Error"], "correct": "[3, 2, 1]"},
        {"title": "Lambda Conditional", "difficulty": "Intermediate", "code": "f = lambda x: 'Pos' if x > 0 else 'Neg'\nprint(f(0))", "options": ["Pos", "Neg", "0", "Error"], "correct": "Neg"},
        {"title": "List Comprehension Nested", "difficulty": "Intermediate", "code": "x = [i+j for i in [1] for j in [10]]\nprint(x)", "options": ["11", "[11]", "[1, 10]", "Error"], "correct": "[11]"},
        {"title": "String Partition", "difficulty": "Intermediate", "code": "print('a-b-c'.partition('-'))", "options": ["('a', '-', 'b-c')", "['a', 'b', 'c']", "('a', 'b', 'c')", "Error"], "correct": "('a', '-', 'b-c')"},
        {"title": "Dict Update Method", "difficulty": "Intermediate", "code": "d = {'a': 1}\nd.update({'b': 2})\nprint(len(d))", "options": ["1", "2", "3", "Error"], "correct": "2"},
        {"title": "Any Mixed Types", "difficulty": "Intermediate", "code": "print(any([None, 0, ' ']))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "All Empty String", "difficulty": "Intermediate", "code": "print(all(['', 1]))", "options": ["True", "False", "None", "Error"], "correct": "False"},
        {"title": "Tuple Index Multiple", "difficulty": "Intermediate", "code": "t = (1, 2, 3, 2)\nprint(t.index(2))", "options": ["1", "3", "2", "Error"], "correct": "1"},
        {"title": "List Insert", "difficulty": "Intermediate", "code": "a = [1, 3]\na.insert(1, 2)\nprint(a)", "options": ["[1, 2, 3]", "[2, 1, 3]", "[1, 3, 2]", "Error"], "correct": "[1, 2, 3]"},
        {"title": "String Split Max", "difficulty": "Intermediate", "code": "print('a-b-c'.split('-', 1))", "options": ["['a', 'b', 'c']", "['a', 'b-c']", "['a-b', 'c']", "Error"], "correct": "['a', 'b-c']"},
        {"title": "Round Negative Prec", "difficulty": "Intermediate", "code": "print(round(123, -1))", "options": ["120", "123", "130", "Error"], "correct": "120"},
        {"title": "Dictionary PopDefault", "difficulty": "Intermediate", "code": "d = {'a': 1}\nprint(d.pop('b', 0))", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "Set IsSubset", "difficulty": "Intermediate", "code": "print({1, 2}.issubset({1, 2, 3}))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "String RStrip", "difficulty": "Intermediate", "code": "print('aba '.rstrip('a '))", "options": ["ab", "b", "aba", "Error"], "correct": "ab"},
        {"title": "Map Combined", "difficulty": "Intermediate", "code": "x = map(str, [1, 2])\nprint(''.join(x))", "options": ["12", "1,2", "['1', '2']", "Error"], "correct": "12"},
        {"title": "Filter Empty", "difficulty": "Intermediate", "code": "x = list(filter(None, [0, 1, False, 'a']))", "options": ["[1, 'a']", "[0, False]", "[]", "Error"], "correct": "[1, 'a']"},
        {"title": "List Extent Tuple", "difficulty": "Intermediate", "code": "a = [1]\na.extend((2, 3))\nprint(len(a))", "options": ["2", "3", "1", "Error"], "correct": "3"},
        {"title": "Dictionary Keys Order", "difficulty": "Intermediate", "code": "d = {'a': 1, 'b': 2}\nprint(list(d.keys())[0])", "options": ["a", "b", "1", "Error"], "correct": "a"},
        {"title": "Zip Equal Len", "difficulty": "Intermediate", "code": "a = [1]\nb = [2]\nprint(list(zip(a, b))[0][1])", "options": ["1", "2", "(1, 2)", "Error"], "correct": "2"},
        {"title": "Range Triple", "difficulty": "Intermediate", "code": "print(list(range(5, 0, -2)))", "options": ["[5, 3, 1]", "[5, 4, 3, 2, 1]", "[5, 3]", "Error"], "correct": "[5, 3, 1]"},
        {"title": "String Swapcase", "difficulty": "Intermediate", "code": "print('aB'.swapcase())", "options": ["Ab", "ab", "AB", "Error"], "correct": "Ab"},
        {"title": "List Clear Object", "difficulty": "Intermediate", "code": "a = [1]\nb = a\na.clear()\nprint(len(b))", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "Bool Float Math", "difficulty": "Intermediate", "code": "print(True + 1.5)", "options": ["2.5", "2", "True1.5", "Error"], "correct": "2.5"},
        {"title": "String Find Reverse", "difficulty": "Intermediate", "code": "print('aba'.rfind('a'))", "options": ["2", "0", "1", "Error"], "correct": "2"},
        {"title": "Dictionary Dict Method", "difficulty": "Intermediate", "code": "d = dict(a=1, b=2)\nprint(d['a'])", "options": ["1", "2", "a", "Error"], "correct": "1"},
        {"title": "Set Sym Difference", "difficulty": "Intermediate", "code": "a = {1, 2}\nb = {2, 3}\nprint(a ^ b)", "options": ["{1, 3}", "{2}", "{1, 2, 3}", "Error"], "correct": "{1, 3}"},
        {"title": "Recursion Depth One", "difficulty": "Intermediate", "code": "def f(x):\n    if x <= 0: return 1\n    return x * f(x-1)\nprint(f(1))", "options": ["1", "0", "Error", "None"], "correct": "1"},
        {"title": "String Capitalize", "difficulty": "Intermediate", "code": "print('hi there'.capitalize())", "options": ["Hi there", "Hi There", "HI THERE", "Error"], "correct": "Hi there"},
        {"title": "Nested Tuple Access", "difficulty": "Intermediate", "code": "t = ((1, 2), (3, 4))\nprint(t[1][1])", "options": ["4", "3", "2", "1"], "correct": "4"},
        {"title": "Bool List Math", "difficulty": "Intermediate", "code": "print(sum([True, False, True]))", "options": ["2", "1", "3", "Error"], "correct": "2"},
        {"title": "Dictionary Get Default", "difficulty": "Intermediate", "code": "d = {}\nprint(d.get('x', 'N'))", "options": ["N", "None", "Error", "x"], "correct": "N"},
        {"title": "String Translate Simple", "difficulty": "Intermediate", "code": "print('abc'.translate({97: 120}))", "options": ["xbc", "abc", "Error", "None"], "correct": "xbc"},
        {"title": "List Remove Missing", "difficulty": "Intermediate", "code": "a = [1]\ntry: a.remove(2)\nexcept ValueError: print('V')", "options": ["V", "None", "Error", "1"], "correct": "V"},
        {"title": "None Comparison Is", "difficulty": "Intermediate", "code": "x = None\nprint(x is None)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Int Power Float", "difficulty": "Intermediate", "code": "print(4**0.5)", "options": ["2.0", "2", "0.5", "Error"], "correct": "2.0"},
        {"title": "Tuple Slicing", "difficulty": "Intermediate", "code": "t = (1, 2, 3)\nprint(t[1:])", "options": ["(2, 3)", "(1, 2)", "[2, 3]", "Error"], "correct": "(2, 3)"},
        {"title": "String ZFill", "difficulty": "Intermediate", "code": "print('5'.zfill(3))", "options": ["005", "500", "050", "Error"], "correct": "005"},
        {"title": "List Multiply Neg", "difficulty": "Intermediate", "code": "a = [1] * -1\nprint(a)", "options": ["[]", "[-1]", "Error", "None"], "correct": "[]"},
        {"title": "Any All Combo", "difficulty": "Intermediate", "code": "print(any([all([1]), 0]))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Dictionary Clear Reference", "difficulty": "Intermediate", "code": "d = {'a': 1}\ne = d\nd.clear()\nprint(len(e))", "options": ["0", "1", "None", "Error"], "correct": "0"},
        {"title": "String Count Overlap", "difficulty": "Intermediate", "code": "print('aaaa'.count('aa'))", "options": ["2", "3", "4", "Error"], "correct": "2"},
        {"title": "Set Superset", "difficulty": "Intermediate", "code": "print({1, 2, 3} >= {1, 2})", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "List Sort Custom", "difficulty": "Intermediate", "code": "a = [1, -5, 2]\nprint(sorted(a, key=abs)[0])", "options": ["1", "-5", "2", "Error"], "correct": "1"},
        {"title": "String IsSpace", "difficulty": "Intermediate", "code": "print('  '.isspace())", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Bool Conversion Int", "difficulty": "Intermediate", "code": "print(int(True) + int(False))", "options": ["1", "2", "0", "True"], "correct": "1"},
        {"title": "Modulo Zero Check", "difficulty": "Intermediate", "code": "try: print(5 % 0)\nexcept ZeroDivisionError: print('Z')", "options": ["Z", "0", "None", "Error"], "correct": "Z"}
    ]

    # Prepare data
    now = datetime.datetime.utcnow().isoformat()
    for c in extra_intermediate:
        c["created_at"] = now
        c["type"] = "prediction"
        c["reward"] = "60 XP"

    try:
        result = collection.insert_many(extra_intermediate)
        print(f"Successfully seeded {len(result.inserted_ids)} EVEN MORE intermediate code challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_even_more_intermediate()
