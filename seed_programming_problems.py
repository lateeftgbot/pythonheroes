import os
import datetime
from dotenv import load_dotenv
from pymongo import MongoClient
import certifi

# Load environment variables
env_path = r'c:\Users\Haryan\source\repos\Lativectors\.env'
load_dotenv(env_path)

def seed_programming_problems():
    uri = os.getenv('MONGO_URI')
    if not uri:
        print("Error: MONGO_URI not found in environment.")
        return

    client = MongoClient(uri, tlsCAFile=certifi.where())
    db = client.get_database('vectors_db')
    collection = db.problem_sets

    basic_tasks = [
        {"title": "Display 'Hello World'", "desc": "Write a program that prints 'Hello World' to the console."},
        {"title": "Sum of Two Numbers", "desc": "Assign values to two variables and print their sum."},
        {"title": "Product of Two Numbers", "desc": "Assign values to two variables and print their product."},
        {"title": "Calculate Cube", "desc": "Given a number, print its cube (x to the power of 3)."},
        {"title": "Area of a Square", "desc": "Given the side length of a square, calculate and print its area."},
        {"title": "Convert Hours to Minutes", "desc": "Given an amount of hours, convert it to minutes and print it."},
        {"title": "Simple Interest", "desc": "Calculate simple interest given Principal (P), Rate (R), and Time (T). Formula: (P*R*T)/100."},
        {"title": "Swap Two Variables", "desc": "Swap the values of two variables x and y without using a temporary variable if possible."},
        {"title": "Last Digit", "desc": "Given an integer, print its last digit using the modulo operator."},
        {"title": "Repeat String", "desc": "Print the string 'Python' 5 times on the same line."},
        
        {"title": "Check Positive", "desc": "Check if a variable 'x' is greater than 0 and print 'Positive'."},
        {"title": "Check Negative", "desc": "Check if a variable 'x' is less than 0 and print 'Negative'."},
        {"title": "Check Zero", "desc": "Check if a variable 'x' is exactly 0 and print 'Zero'."},
        {"title": "Even or Odd", "desc": "Print 'Even' if a number is even, otherwise print 'Odd'."},
        {"title": "Largest of Two", "desc": "Compare two numbers and print the larger one."},
        {"title": "Smallest of Two", "desc": "Compare two numbers and print the smaller one."},
        {"title": "Voting Eligibility", "desc": "Check if age is 18 or older and print 'Eligible', else 'Not Eligible'."},
        {"title": "Divisible by 5", "desc": "Check if a number is divisible by 5 and print 'Yes' or 'No'."},
        {"title": "Grade A Checker", "desc": "If mark is 90 or above, print 'Grade A'."},
        {"title": "Pass/Fail", "desc": "If mark is 40 or above, print 'Pass', else print 'Fail'."},
        
        {"title": "Print 1 to 5", "desc": "Use a for loop to print numbers from 1 to 5."},
        {"title": "Print 5 to 1", "desc": "Use a for loop to print numbers from 5 down to 1."},
        {"title": "Sum of first 10", "desc": "Calculate the sum of integers from 1 to 10 using a loop."},
        {"title": "Squares Table", "desc": "Print the squares of numbers from 1 to 5."},
        {"title": "Multiples of 3", "desc": "Print the first 5 multiples of 3 using a loop."},
        {"title": "Character Counter", "desc": "Loop through the string 'LATIVE' and print each character."},
        {"title": "Double the List", "desc": "Loop through a list [1, 2, 3] and print each value doubled."},
        {"title": "Count Evens in List", "desc": "Count how many even numbers are in [1, 2, 3, 4, 5, 6]."},
        {"title": "Find 5 in List", "desc": "Loop through a list and print 'Found' if the number 5 exists."},
        {"title": "While Loop Countdown", "desc": "Use a while loop to print a countdown from 3 to 1."},
        
        {"title": "List Length", "desc": "Create a list of 4 fruits and print its length."},
        {"title": "First Element", "desc": "Print the first element of the list ['cat', 'dog', 'bird']."},
        {"title": "Last Element", "desc": "Print the last element of the list [10, 20, 30, 40]."},
        {"title": "List Append", "desc": "Add 'orange' to the list ['apple', 'banana'] and print the list."},
        {"title": "List Remove", "desc": "Remove 'red' from ['red', 'green', 'blue'] and print the list."},
        {"title": "List Sum", "desc": "Calculate the sum of [1, 2, 3, 4, 5] using the sum() function."},
        {"title": "List Max", "desc": "Find the maximum value in [15, 2, 88, 7]."},
        {"title": "List Min", "desc": "Find the minimum value in [15, 2, 88, 7]."},
        {"title": "String to List", "desc": "Convert the string 'abc' into a list of characters."},
        {"title": "List Sorting", "desc": "Sort the list [5, 1, 9, 3] in ascending order."},
        
        {"title": "Dictionary Creation", "desc": "Create a dictionary with keys 'name' and 'age' and print it."},
        {"title": "Dict Value Access", "desc": "Print the value of 'brand' from {'brand': 'Ford', 'model': 'Mustang'}."},
        {"title": "Dict Update", "desc": "Change the 'year' to 2024 in {'year': 2020, 'make': 'Toyota'}."},
        {"title": "Dict Keys List", "desc": "Print all keys from the dictionary {'a': 1, 'b': 2}."},
        {"title": "Dict Values List", "desc": "Print all values from the dictionary {'a': 1, 'b': 2}."},
        {"title": "Dict Len", "desc": "Get the number of items in a dictionary."},
        {"title": "Dict Clear", "desc": "Empty all items from a dictionary and print it."},
        {"title": "Set Creation", "desc": "Create a set with values {1, 2, 2, 3} and print it (check duplicates)."},
        {"title": "Set Add", "desc": "Add a new value to an existing set."},
        {"title": "Set Intersection", "desc": "Print common items between {1, 2} and {2, 3}."},
        
        {"title": "String Upper", "desc": "Convert 'hello' to uppercase."},
        {"title": "String Lower", "desc": "Convert 'WORLD' to lowercase."},
        {"title": "String Strip", "desc": "Remove leading/trailing whitespace from '  trim me  '."},
        {"title": "String Replace", "desc": "Replace 'bad' with 'good' in the string 'it is bad'."},
        {"title": "String Sliced", "desc": "Print the first 3 characters of 'Lativectors'."},
        {"title": "String Count 'a'", "desc": "Count how many times 'a' appears in 'banana'."},
        {"title": "Check Digit", "desc": "Check if the string '123' consists only of digits."},
        {"title": "Check Alpha", "desc": "Check if 'abc' consists only of alphabetic characters."},
        {"title": "String Reversal", "desc": "Print the reverse of 'Python' using slicing."},
        {"title": "String StartCheck", "desc": "Check if 'Python' starts with 'Py'."},
        
        {"title": "Simple Function", "desc": "Define a function 'greet' that prints 'Hello' and call it."},
        {"title": "Func with Param", "desc": "Define a function that takes a name and prints 'Hi name'."},
        {"title": "Func Return Add", "desc": "Define a function that returns the sum of two parameters."},
        {"title": "Func Power", "desc": "Define a function that returns the square of a number."},
        {"title": "Func Default Val", "desc": "Create a function with a default parameter value."},
        {"title": "Absolute Value", "desc": "Use abs() to print the absolute value of -10."},
        {"title": "Round Float", "desc": "Round 3.14159 to 2 decimal places."},
        {"title": "Power Function", "desc": "Use pow() to calculate 2 raised to 10."},
        {"title": "Type Check", "desc": "Print the type of the value 10.5."},
        {"title": "Formatted String", "desc": "Print 'I have 5 apples' using f-strings and a variable."},
        
        {"title": "Leap Year Basic", "desc": "Check if a year is divisible by 4 (simple version)."},
        {"title": "Celsius to Kelvin", "desc": "Formula: C + 273.15."},
        {"title": "Rectangle Perimeter", "desc": "Formula: 2 * (length + width)."},
        {"title": "List Slicing Middle", "desc": "Print [2, 3] from [1, 2, 3, 4] using slicing."},
        {"title": "List of Squares", "desc": "Use a list comprehension to create squares of [1, 2, 3]."},
        {"title": "Tuple Indexing", "desc": "Get the second item from a tuple (10, 20, 30)."},
        {"title": "Dictionary Check Key", "desc": "Check if 'email' exists in a dictionary."},
        {"title": "String Find", "desc": "Find the index of 'target' in 'find the target'."},
        {"title": "Modulo Check 10", "desc": "Print True if a number is a multiple of 10."},
        {"title": "Bitwise AND 1", "desc": "Print the result of 5 & 1."},
        
        {"title": "Circle Circumference", "desc": "Formula: 2 * 3.14 * radius."},
        {"title": "Kilometers to Miles", "desc": "1 km = 0.621 miles. Convert 10km."},
        {"title": "List Join", "desc": "Join ['a', 'b', 'c'] with '-' into a string."},
        {"title": "String Split", "desc": "Split 'apple,banana,cherry' by comma into a list."},
        {"title": "Triangle Area", "desc": "Formula: 0.5 * base * height."},
        {"title": "Average of 3", "desc": "Calculate the average of 10, 20, and 30."},
        {"title": "Is Keyword", "desc": "Check if None is None using the 'is' keyword."},
        {"title": "Logical NOT", "desc": "Print the opposite of True."},
        {"title": "Range Step", "desc": "Print even numbers from 2 to 10 using range()."},
        {"title": "List Index Search", "desc": "Find the position of 'x' in ['a', 'x', 'b']."},
        
        {"title": "Sum of Odds", "desc": "Calculate sum of odd numbers between 1 and 10."},
        {"title": "Double for loop", "desc": "Print a 2x2 grid of '*' using nested loops."},
        {"title": "Dict Remove Key", "desc": "Remove 'age' from a dictionary."},
        {"title": "F-string Math", "desc": "Print f'The result is {10+5}'."},
        {"title": "Isalnum check", "desc": "Check if 'Python3' is alphanumeric."},
        {"title": "List pop", "desc": "Remove and print the last item from a list."},
        {"title": "Binary format", "desc": "Convert the number 5 to a binary string."},
        {"title": "Hex format", "desc": "Convert the number 255 to a hex string."},
        {"title": "Float Division", "desc": "Print the result of 5 / 2 (should be 2.5)."},
        {"title": "Integer Division", "desc": "Print the result of 5 // 2 (should be 2)."}
    ]

    # Prepare problem sets
    now = datetime.datetime.utcnow().isoformat()
    problem_sets_data = []
    
    for task in basic_tasks:
        ps_id = str(len(problem_sets_data) + 100) # Start from 100 to avoid conflicts
        new_set = {
            "name": task["title"],
            "description": "",
            "problems": [
                {
                    "id": "1",
                    "difficulty": "Beginner",
                    "description": task["desc"]
                }
            ],
            "updated_at": now,
            "created_at": now,
            "category": "Basic Programming"
        }
        problem_sets_data.append(new_set)

    try:
        # We might want to clear old ones if they were placeholders, but user said "add 100"
        # Let's just insert
        result = collection.insert_many(problem_sets_data)
        print(f"Successfully seeded {len(result.inserted_ids)} BASIC programming problem sets.")
    except Exception as e:
        print(f"Error during seeding: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    seed_programming_problems()
