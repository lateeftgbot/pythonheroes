from flask_mail import Mail
from itsdangerous import URLSafeTimedSerializer
from pymongo import MongoClient
import os
import certifi

# Initialize extensions without app
mail = Mail()
serializer = None

# MongoDB Connection variables
client = None
db = None
users_collection = None
learning_materials_collection = None
projects_collection = None
problem_sets_collection = None
ai_cache_collection = None
code_predictions_collection = None
pvp_queue_collection = None
pvp_matches_collection = None
solo_battles_collection = None

def init_extensions(app):
    global serializer, client, db, users_collection, learning_materials_collection, projects_collection, problem_sets_collection, ai_cache_collection, code_predictions_collection, pvp_queue_collection, pvp_matches_collection, solo_battles_collection
    
    # Initialize Mail
    mail.init_app(app)
    
    # Initialize Serializer
    serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
    
    # Initial MongoDB Connection
    uri = app.config.get('MONGO_URI')
    if uri:
        try:
            client = MongoClient(uri, tlsCAFile=certifi.where())
            db = client.get_database('vectors_db')
            users_collection = db.users
            learning_materials_collection = db.learning_materials
            projects_collection = db.projects
            problem_sets_collection = db.problem_sets
            ai_cache_collection = db.ai_cache
            code_predictions_collection = db.code_predictions
            pvp_queue_collection = db.pvp_queue
            pvp_matches_collection = db.pvp_matches
            solo_battles_collection = db.solo_battles
            print("MongoDB client initialized from extensions")
        except Exception as e:
            print(f"MongoDB init error in extensions: {e}")
