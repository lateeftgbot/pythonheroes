import os
import json
from google import genai
from google.genai import types
from flask import Blueprint, request, jsonify
from ..utils import ensure_connection
from datetime import datetime

ai_teacher_bp = Blueprint('ai_teacher', __name__)

# Generation config for the new SDK
# Note: Newer SDK uses a different config structure within the GenerateContentConfig
DEFAULT_MODEL = "gemini-2.0-flash"


SYSTEM_PROMPT = """
You are 'Vectors', the expert AI Python Teacher for the Lativectors platform. 
Your goal is to teach students Python in an engaging, clear, and interactive way.
When a student asks a question or selects a category (Basic, Intermediate, Advanced, Libraries), provide a structured lesson based on the official curriculum below.

CRITICAL INSTRUCTIONS:
1. **Always** include all fields in the JSON schema below. Every field MUST be a string or list as defined; never leave them as null or undefined.
2. Provide a clear, encouraging verbal introduction in the 'explanation' field.
3. Provide a single, complete Python code snippet in the 'code' field. Use meaningful variable names (e.g., 'user_name' instead of 'x').
4. Provide a list of 'highlights' mapping specific lines to technical comments. If you want to highlight a specific part of a line (like a function name or a variable), include the 'portion' field with that exact substring.
5. Provide a list of 'steps' for sequential interaction. Each step must contain 'code' (one or more lines of VALID Python) and 'narration' (what you say about that code). **DO NOT leave 'code' empty or null in steps.**
6. Provide a 'conclusion' summarizing the lesson.

AUDIO OPTIMIZATION (CRITICAL):
The 'explanation', 'narration', and 'conclusion' fields are read aloud by a text-to-speech engine. 
- **DO NOT** use Markdown symbols like **, *, _, #, or ` in these fields. 
- **DO NOT** use characters like (parentheses), [brackets], or {braces} in spoken text unless they are part of a name.
- **DO NOT** use special characters that sound awkward when spoken (like excessive quotes or backslashes).
- Write in natural, fluid sentences. Instead of saying "Use `print()`", say "Use the print function". Instead of "Python **heroes**", say "Python heroes".

JSON Schema (Strict):
{
  "explanation": "Lesson introduction in plain text without any markdown or special symbols.",
  "code": "Full Python snippet with meaningful names.",
  "highlights": [
    { "lines": [1], "portion": "print", "comment": "The print function outputs text." }
  ],
  "steps": [
    { "code": "print('Hello')", "narration": "First, we use the print function to say hello." }
  ],
  "conclusion": "Closing encouragement in plain text."
}

OFFICIAL BEGINNER ROADMAP (20 Lessons):
1. Introduction to Programming (Install, Execution)
2. Python Syntax & Structure (Indentation, Scripts, Comments)
3. Variables (Creation, Naming, Dynamic Typing)
4. Data Types (Integer, Float, String, Boolean)
5. Working with Strings (Methods, Formatting, F-strings)
6. Operators (Arithmetic, Comparison, Logical)
7. User Input (input(), Type Conversion)
8. Conditional Statements (if, elif, else)
9. Loops Part 1 (while loop, Control)
10. Loops Part 2 (for loop, Iteration)
11. Lists (Methods, Accessing, Modification)
12. Tuples (Immutable objects, Basics)
13. Dictionaries (Key-value pairs, Modifying)
14. Sets (Unique data, Operations)
15. Functions Part 1 (Defining, Calling)
16. Functions Part 2 (Parameters, Return values)
17. Modules (Importing, Standard Library)
18. File Handling (Reading, Writing)
19. Error Handling (try, except, Debugging)
20. Beginner Project (Calculator, To-do list, Guessing Game)

Maintain a friendly, professional, and 'heroic' tone. Do not include any text outside of the JSON object.
"""

@ai_teacher_bp.route('/api/ai-teacher/ask', methods=['POST'])
def ask_teacher():
    from ..ai_utils import AIRouter

    try:
        data = request.json
        prompt = data.get('prompt', 'Hello!')
        category = data.get('category', 'General')
        
        # Get lesson via the AI Router (handles caching, local AI, and Gemini)
        result, from_cache, usage = AIRouter.get_lesson(
            prompt=prompt,
            category=category,
            system_prompt=SYSTEM_PROMPT,
            model=DEFAULT_MODEL
        )

        # Record token usage if not from cache
        if not from_cache and usage:
            user_email = data.get('email')
            if user_email:
                from .. import extensions
                extensions.users_collection.update_one(
                    {"email": user_email},
                    {"$inc": {
                        "ai_usage.prompt_tokens": usage.get("prompt_tokens", 0),
                        "ai_usage.candidates_tokens": usage.get("candidates_tokens", 0),
                        "ai_usage.total_tokens": usage.get("total_tokens", 0),
                        "ai_usage.request_count": 1
                    }}
                )

        # Normalize and Ensure Safety
        explanation = str(result.get("explanation", "") or "")
        code = str(result.get("code", "") or "# No code provided.")
        conclusion = str(result.get("conclusion", "") or "")
        
        raw_steps = result.get("steps", [])
        steps = []
        if isinstance(raw_steps, list):
            for s in raw_steps:
                if isinstance(s, dict):
                    steps.append({
                        "code": str(s.get("code", "") or ""),
                        "narration": str(s.get("narration", "") or "")
                    })

        response_data = {
            "explanation": explanation,
            "code": code,
            "highlights": result.get("highlights", []),
            "steps": steps,
            "conclusion": conclusion,
            "usage": usage # Return actual usage for this call
        }
        
        if from_cache:
            response_data["_cached"] = True

        return jsonify(response_data), 200

    except Exception as e:
        print(f"AI Teacher API Error: {e}")
        return jsonify({
            "explanation": f"I'm having trouble connecting to my brain right now: {str(e)}",
            "code": "# Error Encountered\n# Ensure your AI configuration is correct.",
            "highlights": [],
            "steps": [],
            "conclusion": "Contact support if this persists."
        }), 200 # Return 200 so frontend shows the error message gracefully

@ai_teacher_bp.route('/api/ai-teacher/categories', methods=['GET'])
def get_categories():
    return jsonify({
        "categories": [
            {"id": "basic", "name": "Python Basics", "icon": "Code"},
            {"id": "intermediate", "name": "Intermediate Python", "icon": "Layers"},
            {"id": "advanced", "name": "Advanced Techniques", "icon": "Zap"},
            {"id": "libraries", "name": "Python Libraries", "icon": "Library"}
        ]
    }), 200
