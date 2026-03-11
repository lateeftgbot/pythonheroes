import os
import json
import hashlib
from google import genai
from google.genai import types
from datetime import datetime
from . import extensions
from .utils import ensure_connection

class AIRouter:
    @staticmethod
    def _generate_cache_key(prompt, category, system_prompt):
        """Generate a unique key for the prompt and context"""
        combined = f"{system_prompt}|{category}|{prompt}"
        return hashlib.sha256(combined.encode('utf-8')).hexdigest()

    @staticmethod
    def _calculate_similarity(vec1, vec2):
        """Calculate cosine similarity"""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        mag1 = sum(a * a for a in vec1) ** 0.5
        mag2 = sum(b * b for b in vec2) ** 0.5
        
        if mag1 == 0 or mag2 == 0:
            return 0
            
        return dot_product / (mag1 * mag2)

    @staticmethod
    def get_lesson(prompt, category, system_prompt, model="gemini-2.0-flash"):
        """
        Get a lesson from cache (Exact or Semantic), local AI, or Gemini API.
        Returns: (result_dict, from_cache_bool, usage_metadata_dict)
        """
        if not ensure_connection():
            print("AI Router: Database connection failed.")
        
        api_key = os.getenv('GEMINI_API_KEY', '')
        if not api_key:
            raise Exception("GEMINI_API_KEY not configured in environment.")

        client = genai.Client(api_key=api_key)
        
        # 1. Exact Match Check
        cache_key = AIRouter._generate_cache_key(prompt, category, system_prompt)
        if extensions.ai_cache_collection is not None:
            cached_response = extensions.ai_cache_collection.find_one({"cache_key": cache_key})
            if cached_response:
                print(f"AI Router: Exact Cache Hit for {cache_key}")
                return cached_response.get("response"), True, {"prompt_tokens": 0, "candidates_tokens": 0, "total_tokens": 0}

        # 2. Get Embedding for Semantic Search
        print(f"AI Router: Calculating semantic fingerprint...")
        try:
            curr_embedding_resp = client.models.embed_content(
                model="gemini-embedding-001",
                contents=prompt
            )
            curr_embedding = curr_embedding_resp.embeddings[0].values
        except Exception as e:
            print(f"AI Router: Embedding failed: {e}")
            curr_embedding = None

        # 3. Semantic Search Check
        if curr_embedding and extensions.ai_cache_collection is not None:
            # For efficiency in this demo, we look at the last 100 cache entries in this category
            # A real production app would use Atlas Vector Search indexes
            potential_matches = extensions.ai_cache_collection.find(
                {"category": category, "embedding": {"$exists": True}}
            ).sort("created_at", -1).limit(100)

            best_match = None
            highest_score = 0

            for entry in potential_matches:
                score = AIRouter._calculate_similarity(curr_embedding, entry.get("embedding"))
                if score > highest_score:
                    highest_score = score
                    best_match = entry
                
                if highest_score > 0.98: # Early exit for very strong matches
                    break

            if highest_score > 0.96: # Threshold of 96%
                print(f"AI Router: Semantic Hit! Similarity: {highest_score:.2f}")
                return best_match.get("response"), True, {"prompt_tokens": 0, "candidates_tokens": 0, "total_tokens": 0}

        # 4. Check Local AI (Placeholders)
        # ...

        # 5. Call External API (Gemini)
        print(f"AI Router: Cache Miss. Calling external API...")
        full_prompt = f"Category: {category}\nStudent: {prompt}"

        response = client.models.generate_content(
            model=model,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
                top_p=0.95,
                top_k=40,
                max_output_tokens=8192,
                response_mime_type="application/json"
            )
        )

        try:
            result = json.loads(response.text)
            
            # Use usage_metadata if available
            usage = response.usage_metadata
            token_info = {
                "prompt_tokens": usage.prompt_token_count if usage else 0,
                "candidates_tokens": usage.candidates_token_count if usage else 0,
                "total_tokens": usage.total_token_count if usage else 0
            }

            # 6. Save to Cache with Embedding
            if extensions.ai_cache_collection is not None:
                extensions.ai_cache_collection.insert_one({
                    "cache_key": cache_key,
                    "prompt": prompt,
                    "category": category,
                    "response": result,
                    "usage": token_info,
                    "embedding": curr_embedding,
                    "created_at": datetime.utcnow()
                })
                print(f"AI Router: Response cached (Semantic fingerprinted)")
            
            return result, False, token_info
            
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"AI Router: Failed to parse AI response: {e}")
            raise Exception("AI returned an invalid response format.")

    @staticmethod
    def _call_local_ai(prompt, category, system_prompt):
        """Placeholder for local LLM integration (e.g., Ollama)"""
        # Implementation would involve requests.post('http://localhost:11434/api/generate', ...)
        return None
