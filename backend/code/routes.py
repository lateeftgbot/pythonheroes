from flask import Blueprint, request, jsonify
import datetime
from bson.objectid import ObjectId
from .. import extensions
from ..utils import ensure_connection

code_bp = Blueprint('code', __name__)

@code_bp.route('/api/code/v1/save', methods=['POST', 'GET'])
def save_project():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.json
    if not data or not data.get('email') or not data.get('code') or not data.get('title'):
        return jsonify({"error": "Missing required fields"}), 400
    
    project = {
        "email": data['email'],
        "title": data['title'],
        "code": data['code'],
        "language": data.get('language', 'python'),
        "folder": data.get('folder', 'Python Heroes/Projects'),
        "updated_at": datetime.datetime.utcnow().isoformat(),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    try:
        # Update if name exists for same user, or create new
        # For simplicity in this logic, we'll use title as unique per user
        result = extensions.projects_collection.update_one(
            {"email": data['email'], "title": data['title']},
            {"$set": project},
            upsert=True
        )
        return jsonify({"message": "Project saved successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@code_bp.route('/api/code/v1/list', methods=['GET'])
def list_projects():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    try:
        projects = list(extensions.projects_collection.find({"email": email}))
        for p in projects:
            p['id'] = str(p['_id'])
            del p['_id']
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@code_bp.route('/api/code/test', methods=['GET'])
def test_code():
    return jsonify({"status": "code module active"}), 200
