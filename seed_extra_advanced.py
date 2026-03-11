import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_extra_advanced():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.code_predictions

    extra_advanced = [
        {"title": "Nonlocal Keyword", "difficulty": "Advanced", "code": "def outer():\n    x = 10\n    def inner():\n        nonlocal x\n        x += 5\n        return x\n    return inner\nf = outer()\nprint(f())", "options": ["10", "15", "5", "Error"], "correct": "15"},
        {"title": "Decorator with Args", "difficulty": "Advanced", "code": "def wrap(n):\n    def dec(f):\n        return lambda: f() * n\n    return dec\n@wrap(3)\ndef get_v(): return 2\nprint(get_v())", "options": ["2", "3", "6", "Error"], "correct": "6"},
        {"title": "Generator Send", "difficulty": "Advanced", "code": "def g():\n    x = yield 1\n    yield x + 1\nval = g()\nnext(val)\nprint(val.send(10))", "options": ["1", "11", "10", "Error"], "correct": "11"},
        {"title": "Property Setter", "difficulty": "Advanced", "code": "class A:\n    def __init__(self): self._v = 0\n    @property\n    def v(self): return self._v\n    @v.setter\n    def v(self, val): self._v = val * 2\na = A()\na.v = 5\nprint(a.v)", "options": ["0", "5", "10", "Error"], "correct": "10"},
        {"title": "Super Init", "difficulty": "Advanced", "code": "class P: v = 1\nclass C(P): \n    def __init__(self): self.v = 2\nc = C()\nprint(super(C, c).v)", "options": ["1", "2", "None", "Error"], "correct": "1"},
        {"title": "Closure Late Binding", "difficulty": "Advanced", "code": "funcs = [lambda: i for i in range(3)]\nprint(funcs[0]())", "options": ["0", "1", "2", "Error"], "correct": "2"},
        {"title": "Manual Iterator", "difficulty": "Advanced", "code": "it = iter([1, 2])\nnext(it)\nprint(next(it, 0))", "options": ["1", "2", "0", "None"], "correct": "2"},
        {"title": "Class Method Variable", "difficulty": "Advanced", "code": "class A:\n    v = 1\n    @classmethod\n    def up(cls): cls.v += 1\nA.up()\nprint(A.v)", "options": ["1", "2", "A", "Error"], "correct": "2"},
        {"title": "Static Method State", "difficulty": "Advanced", "code": "class A:\n    @staticmethod\n    def f(x): return x * 2\nprint(A().f(5))", "options": ["5", "10", "None", "Error"], "correct": "10"},
        {"title": "GetAttr Recursive", "difficulty": "Advanced", "code": "class A:\n    def __getattr__(self, name):\n        return name\na = A()\nprint(a.hello)", "options": ["hello", "None", "Error", "a.hello"], "correct": "hello"},
        {"title": "Slots Restriction", "difficulty": "Advanced", "code": "class A:\n    __slots__ = ['x']\na = A()\na.x = 1\ntry: a.y = 2\nexcept AttributeError: print('E')", "options": ["1", "2", "E", "None"], "correct": "E"},
        {"title": "Nested Decorators", "difficulty": "Advanced", "code": "def d1(f): return lambda: f() + '1'\ndef d2(f): return lambda: f() + '2'\n@d1\n@d2\ndef f(): return '0'\nprint(f())", "options": ["012", "021", "120", "Error"], "correct": "021"},
        {"title": "Unpacking with Star", "difficulty": "Advanced", "code": "a, *b, c = [1, 2, 3, 4]\nprint(b)", "options": ["2", "3", "[2, 3]", "4"], "correct": "[2, 3]"},
        {"title": "Set Default Deep", "difficulty": "Advanced", "code": "d = {}\nd.setdefault('a', []).append(1)\nprint(d['a'])", "options": ["[1]", "[]", "1", "Error"], "correct": "[1]"},
        {"title": "Iter with Sentinel", "difficulty": "Advanced", "code": "data = [1, 2, 0, 3]\nit = iter(lambda: data.pop(0), 0)\nprint(list(it))", "options": ["[1, 2, 0, 3]", "[1, 2]", "[1, 2, 3]", "Error"], "correct": "[1, 2]"},
        {"title": "Non-local Shadow", "difficulty": "Advanced", "code": "x = 1\ndef f():\n    x = 2\n    def g():\n        nonlocal x\n        x = 3\n    g()\n    return x\nprint(f() + x)", "options": ["3", "4", "5", "6"], "correct": "4"},
        {"title": "Descriptor Basic", "difficulty": "Advanced", "code": "class D:\n    def __get__(self, obj, typ): return 10\nclass A: x = D()\nprint(A().x)", "options": ["D", "10", "None", "Error"], "correct": "10"},
        {"title": "Super Multi Inherit", "difficulty": "Advanced", "code": "class A: v = 'A'\nclass B(A): v = 'B'\nclass C(B): pass\nprint(C().v)", "options": ["A", "B", "C", "Error"], "correct": "B"},
        {"title": "List Addition Mult", "difficulty": "Advanced", "code": "a = [[]]\na[0].append(1)\nb = a + a\nb[0].append(2)\nprint(len(b[1]))", "options": ["1", "2", "0", "Error"], "correct": "2"},
        {"title": "String Formatting Dict", "difficulty": "Advanced", "code": "d = {'x': 10}\nprint('%(x)s' % d)", "options": ["10", "x", "%(x)s", "Error"], "correct": "10"},
        {"title": "Function Default Mutable 2", "difficulty": "Advanced", "code": "def f(x, a=[]):\n    a.append(x)\n    return a\nf(1)\nprint(f(2))", "options": ["[2]", "[1, 2]", "Error", "[1]"], "correct": "[1, 2]"},
        {"title": "Complex Slicing Step", "difficulty": "Advanced", "code": "a = [0, 1, 2, 3, 4, 5]\nprint(a[1:5:2])", "options": ["[1, 3]", "[1, 2, 3, 4]", "[2, 4]", "Error"], "correct": "[1, 3]"},
        {"title": "Dict Update Items", "difficulty": "Advanced", "code": "d = {'a': 1}\nd.update(a=2, b=3)\nprint(d['a'])", "options": ["1", "2", "3", "Error"], "correct": "2"},
        {"title": "None Is Keyword", "difficulty": "Advanced", "code": "def f(x=None):\n    return x or 'Default'\nprint(f())", "options": ["None", "Default", "Error", "x"], "correct": "Default"},
        {"title": "Tuple Equality ID", "difficulty": "Advanced", "code": "a = (1, 2)\nb = (1, 2)\nprint(a == b, a is b)", "options": ["True True", "True False", "False False", "Error"], "correct": "True False"},
        {"title": "Set Difference Symmetric", "difficulty": "Advanced", "code": "a = {1, 2}\nb = {2, 3}\nprint(a ^ b)", "options": ["{1, 3}", "{2}", "{1, 2, 3}", "Error"], "correct": "{1, 3}"},
        {"title": "Generator Return", "difficulty": "Advanced", "code": "def g():\n    yield 1\n    return 2\nit = g()\nnext(it)\ntry: next(it)\nexcept StopIteration as e: print(e.value)", "options": ["1", "2", "None", "Error"], "correct": "2"},
        {"title": "Lambda Lexical Scope", "difficulty": "Advanced", "code": "x = 10\nf = lambda y: x + y\nx = 20\nprint(f(5))", "options": ["15", "25", "Error", "None"], "correct": "25"},
        {"title": "Class Base Check", "difficulty": "Advanced", "code": "class A: pass\nclass B(A): pass\nprint(isinstance(B(), A))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Iter Unpack", "difficulty": "Advanced", "code": "it = iter('ABC')\na, *b = it\nprint(b)", "options": ["['B', 'C']", "['A', 'B', 'C']", "BC", "Error"], "correct": "['B', 'C']"},
        {"title": "Reduce Basic", "difficulty": "Advanced", "code": "from functools import reduce\nprint(reduce(lambda x, y: x+y, [1, 2, 3]))", "options": ["5", "6", "123", "Error"], "correct": "6"},
        {"title": "Any generator", "difficulty": "Advanced", "code": "print(any(n > 5 for n in [1, 10, 2]))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "All empty generator", "difficulty": "Advanced", "code": "print(all(n < 0 for n in []))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Dict Items Type", "difficulty": "Advanced", "code": "d = {1: 'a'}\nprint(type(d.items()))", "options": ["list", "dict_items", "tuple", "Error"], "correct": "<class 'dict_items'>"},
        {"title": "String Join Generator", "difficulty": "Advanced", "code": "print('-'.join(str(n) for n in [1, 2]))", "options": ["1-2", "12", "['1', '2']", "Error"], "correct": "1-2"},
        {"title": "List In Place Sort", "difficulty": "Advanced", "code": "a = [3, 2, 1]\nprint(a.sort() or a[0])", "options": ["None", "1", "3", "Error"], "correct": "1"},
        {"title": "F-String Binary", "difficulty": "Advanced", "code": "print(f'{5:b}')", "options": ["5", "101", "0b101", "Error"], "correct": "101"},
        {"title": "Byte Literal", "difficulty": "Advanced", "code": "print(len(b'\\x00\\x01'))", "options": ["2", "4", "0", "Error"], "correct": "2"},
        {"title": "Memoryview Basics", "difficulty": "Advanced", "code": "b = bytearray(b'abc')\nm = memoryview(b)\nprint(m[0])", "options": ["a", "97", "b'a'", "Error"], "correct": "97"},
        {"title": "Callable Check", "difficulty": "Advanced", "code": "class A:\n    def __call__(self): return 1\nprint(callable(A()))", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Identity vs Equality 2", "difficulty": "Advanced", "code": "x = 257\ny = 257\nprint(x == y, x is y)", "options": ["True True", "True False", "False False", "Error"], "correct": "True False"},
        {"title": "Small Int Caching", "difficulty": "Advanced", "code": "x = 10\ny = 10\nprint(x is y)", "options": ["True", "False", "None", "Error"], "correct": "True"},
        {"title": "Complex List Comp 2", "difficulty": "Advanced", "code": "x = [i for i in range(2) for j in range(2)]\nprint(len(x))", "options": ["2", "4", "1", "Error"], "correct": "4"},
        {"title": "Dictionary Clear All", "difficulty": "Advanced", "code": "d = {1: 2}\ne = d.copy()\nd[1] = 3\nprint(e[1])", "options": ["2", "3", "None", "Error"], "correct": "2"},
        {"title": "Set Remove Error", "difficulty": "Advanced", "code": "s = {1}\ntry: s.remove(2)\nexcept KeyError: print('K')", "options": ["None", "K", "Error", "1"], "correct": "K"},
        {"title": "Tuple Ref Inside", "difficulty": "Advanced", "code": "a = [1]\nt = (a,)\na.append(2)\nprint(t[0])", "options": ["[1]", "[1, 2]", "(1,)", "Error"], "correct": "[1, 2]"},
        {"title": "Recursive Lambda", "difficulty": "Advanced", "code": "f = lambda n: 1 if n <= 1 else n * f(n-1)\nprint(f(3))", "options": ["3", "6", "1", "Error"], "correct": "6"},
        {"title": "Map None Func", "difficulty": "Advanced", "code": "x = map(None, [1, 2])\ntry: list(x)\nexcept TypeError: print('E')", "options": ["[(None, 1), (None, 2)]", "E", "[1, 2]", "Error"], "correct": "E"},
        {"title": "String Format Unpack", "difficulty": "Advanced", "code": "a = [1, 2]\nprint('{0[0]}'.format(a))", "options": ["1", "2", "index 0", "Error"], "correct": "1"},
        {"title": "Bool Is Instance", "difficulty": "Advanced", "code": "print(isinstance(True, int))", "options": ["True", "False", "None", "Error"], "correct": "True"}
    ]

    # Prepare data
    now = datetime.datetime.utcnow().isoformat()
    for c in extra_advanced:
        c["created_at"] = now
        c["type"] = "prediction"
        c["reward"] = "100 XP"

    try:
        result = collection.insert_many(extra_advanced)
        print(f"Successfully seeded {len(result.inserted_ids)} EXTRA advanced code challenges.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_extra_advanced()
