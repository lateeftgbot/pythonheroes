from flask import Blueprint, request, jsonify, current_app
import os
import datetime
from bson.objectid import ObjectId
from werkzeug.utils import secure_filename
from .. import extensions
from ..utils import ensure_connection, require_admin

learning_bp = Blueprint('learning', __name__)

@learning_bp.route('/api/learning/materials', methods=['GET'])
def get_materials():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        materials = list(extensions.learning_materials_collection.find())
        for m in materials:
            m['_id'] = str(m['_id'])
        return jsonify(materials), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/problem-sets', methods=['GET'])
def get_problem_sets():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        # Fetch all problem sets that are public/available
        sets = list(extensions.problem_sets_collection.find().sort("updated_at", -1))
        for s in sets:
            s['id'] = str(s['_id'])
            del s['_id']
        return jsonify(sets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/code-predictions', methods=['GET'])
def get_code_predictions():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        page = int(request.args.get('page', 0))
        limit = int(request.args.get('limit', 6))
        difficulty = request.args.get('difficulty', '')

        query = {}
        if difficulty and difficulty != 'All':
            query['difficulty'] = difficulty

        total = extensions.code_predictions_collection.count_documents(query)
        predictions = list(
            extensions.code_predictions_collection
            .find(query)
            .skip(page * limit)
            .limit(limit)
        )
        for p in predictions:
            p['id'] = str(p['_id'])
            del p['_id']
        return jsonify({"items": predictions, "total": total, "page": page, "limit": limit}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/categories', methods=['GET'])
def get_categories():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        categories = extensions.code_predictions_collection.distinct('category')
        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/challenges/random', methods=['GET'])
def get_random_challenges():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        limit = int(request.args.get('limit', 5))
        difficulties = request.args.get('difficulty', 'All').split(',')
        category = request.args.get('category', '')
        
        query = {}
        if difficulties and 'All' not in difficulties:
            query['difficulty'] = {"$in": difficulties}
        
        if category:
            query['category'] = category
            
        challenges = list(extensions.code_predictions_collection.aggregate([
            {"$match": query},
            {"$sample": {"size": limit}}
        ]))
        
        for ch in challenges:
            ch['id'] = str(ch['_id'])
            del ch['_id']
            
        return jsonify(challenges), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/materials', methods=['POST'])
@require_admin
def add_material():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    # Handle multi-part (file) or JSON
    if request.content_type and 'multipart/form-data' in request.content_type:
        title = request.form.get('title')
        description = request.form.get('description', '')
        m_type = request.form.get('type')
        category = request.form.get('category', 'General')
        raw_text = request.form.get('raw_text', '')
        url = request.form.get('url', '')
        # document_settings might be a JSON string in form-data
        document_settings_raw = request.form.get('document_settings', '{}')
        try:
            import json
            document_settings = json.loads(document_settings_raw)
        except:
            document_settings = {}
        
        file = request.files.get('file')
        if file and file.filename:
            filename = secure_filename(f"{datetime.datetime.now().timestamp()}_{file.filename}")
            upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(upload_path)
            url = f"/uploads/{filename}"
    else:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "No data provided"}), 400
        title = data.get('title')
        description = data.get('description', '')
        m_type = data.get('type')
        url = data.get('url', '')
        category = data.get('category', 'General')
        raw_text = data.get('raw_text', '')
        document_settings = data.get('document_settings', {})
    
    if not title or (not url and not raw_text):
        return jsonify({"error": "Title and either URL or Raw Text are required"}), 400

    new_material = {
        "title": title,
        "description": description,
        "type": m_type,
        "url": url,
        "category": category,
        "raw_text": raw_text,
        "document_settings": document_settings,
        "created_at": datetime.datetime.utcnow().isoformat(),
        "created_by": request.headers.get('X-Admin-Email')
    }

    try:
        result = extensions.learning_materials_collection.insert_one(new_material)
        new_material['_id'] = str(result.inserted_id)
        return jsonify(new_material), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/materials/<material_id>', methods=['PUT'])
@require_admin
def update_material(material_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    # Simple JSON update for now, can expand later if file update is needed
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400

    update_fields = {}
    for field in ['title', 'description', 'type', 'url', 'category', 'raw_text', 'document_settings']:
        if field in data:
            update_fields[field] = data[field]

    try:
        extensions.learning_materials_collection.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": update_fields}
        )
        return jsonify({"message": "Material updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/materials/<material_id>', methods=['DELETE'])
@require_admin
def delete_material(material_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        extensions.learning_materials_collection.delete_one({"_id": ObjectId(material_id)})
        return jsonify({"message": "Material deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/enroll', methods=['POST'])
def enroll_material():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.get_json(silent=True)
    if not data or not data.get('email') or not data.get('material_id'):
        return jsonify({"error": "Email and Material ID are required"}), 400
    
    email = data.get('email')
    material_id = data.get('material_id')

    try:
        # Update user's enrolled_materials list
        # Using $addToSet to prevent duplicates
        result = extensions.users_collection.update_one(
            {"email": email},
            {"$addToSet": {"enrolled_materials": material_id}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({"message": "Enrolled successfully", "enrolled_materials": material_id}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/enrolled/<email>', methods=['GET'])
def get_enrolled_materials(email):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        user = extensions.users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        enrolled = user.get('enrolled_materials', [])
        return jsonify(enrolled), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/scroll-position', methods=['POST'])
def save_scroll_position():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.get_json(silent=True)
    if not data or not data.get('email') or not data.get('material_id'):
        return jsonify({"error": "Email and Material ID are required"}), 400
    
    email = data.get('email')
    material_id = data.get('material_id')
    scroll_position = data.get('scroll_position', 0)  # Percentage (0-100)
    
    try:
        # Store scroll position in user's progress tracking
        # Structure: { material_id: { scroll_position: %, last_read: timestamp } }
        result = extensions.users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    f"enrolled_materials_progress.{material_id}": {
                        "scroll_position": scroll_position,
                        "last_read": datetime.datetime.utcnow().isoformat()
                    }
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({"message": "Scroll position saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/scroll-position/<material_id>', methods=['GET'])
def get_scroll_position(material_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email parameter is required"}), 400
    
    try:
        user = extensions.users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        progress = user.get('enrolled_materials_progress', {})
        material_progress = progress.get(material_id, {})
        scroll_position = material_progress.get('scroll_position', 0)
        
        return jsonify({"scroll_position": scroll_position}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@learning_bp.route('/api/learning/pvp/join', methods=['POST'])
def pvp_join():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.get_json(silent=True)
    if not data or not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
    
    email = data.get('email')
    name = data.get('name', 'Anonymous Student')
    difficulty = data.get('difficulty', 'Beginner')
    
    # Check if already in an active match
    active_match = extensions.pvp_matches_collection.find_one({
        "$or": [{"player1.email": email}, {"player2.email": email}],
        "status": "active"
    })
    
    if active_match:
        active_match['id'] = str(active_match['_id'])
        del active_match['_id']
        return jsonify({"status": "matched", "match": active_match}), 200

    # Look for another player in the queue for the same difficulty (Atomic removal)
    other_player = extensions.pvp_queue_collection.find_one_and_delete({
        "email": {"$ne": email},
        "difficulty": difficulty
    })
    
    if other_player:
        match = _create_pvp_match(
            {"email": other_player['email'], "name": other_player['name']},
            {"email": email, "name": name},
            difficulty
        )
        return jsonify({"status": "matched", "match": match}), 200
    else:
        # Add to queue (upsert)
        extensions.pvp_queue_collection.update_one(
            {"email": email},
            {"$set": {
                "name": name,
                "difficulty": difficulty,
                "joined_at": datetime.datetime.utcnow().isoformat()
            }},
            upsert=True
        )
        return jsonify({"status": "searching"}), 200

def _create_pvp_match(p1, p2, difficulty):
    import uuid
    challenges = list(extensions.code_predictions_collection.aggregate([
        {"$match": {"difficulty": difficulty}},
        {"$sample": {"size": 5}}
    ]))
    for ch in challenges:
        ch['id'] = str(ch['_id'])
        del ch['_id']
        
    new_match = {
        "match_id": str(uuid.uuid4()),
        "player1": {"email": p1['email'], "name": p1.get('name', 'Anonymous'), "score": 0},
        "player2": {"email": p2['email'], "name": p2.get('name', 'Anonymous'), "score": 0},
        "challenges": challenges,
        "status": "active",
        "difficulty": difficulty,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    
    insert_res = extensions.pvp_matches_collection.insert_one(new_match)
    new_match['id'] = str(insert_res.inserted_id)
    del new_match['_id']
    return new_match

@learning_bp.route('/api/learning/pvp/status', methods=['GET'])
def pvp_status():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400
        
    match = extensions.pvp_matches_collection.find_one({
        "$or": [{"player1.email": email}, {"player2.email": email}],
        "status": "active"
    })
    
    if match:
        match['id'] = str(match['_id'])
        del match['_id']
        return jsonify({"status": "matched", "match": match}), 200
    
    in_queue = extensions.pvp_queue_collection.find_one({"email": email})
    if in_queue:
        # Fallback matchmaking during poll: 
        # if somehow Player A and B both entered queue without matching,
        # the first one to poll /status will attempt to pull the other out.
        other_player = extensions.pvp_queue_collection.find_one_and_delete({
            "email": {"$ne": email},
            "difficulty": in_queue['difficulty']
        })
        if other_player:
            # Atomic match-up
            extensions.pvp_queue_collection.delete_one({"email": email})
            match = _create_pvp_match(
                {"email": other_player['email'], "name": other_player['name']},
                {"email": in_queue['email'], "name": in_queue['name']},
                in_queue['difficulty']
            )
            return jsonify({"status": "matched", "match": match}), 200
        return jsonify({"status": "searching"}), 200
        
    return jsonify({"status": "idle"}), 200

@learning_bp.route('/api/learning/pvp/update-score', methods=['POST'])
def pvp_update_score():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.get_json(silent=True)
    match_id = data.get('match_id')
    email = data.get('email')
    score = data.get('score', 0)
    
    if not match_id or not email:
        return jsonify({"error": "Match ID and Email are required"}), 400
    
    match = extensions.pvp_matches_collection.find_one({"match_id": match_id})
    if not match:
        return jsonify({"error": "Match not found"}), 404
        
    if match['player1']['email'] == email:
        extensions.pvp_matches_collection.update_one(
            {"match_id": match_id},
            {"$set": {"player1.score": score}}
        )
    else:
        extensions.pvp_matches_collection.update_one(
            {"match_id": match_id},
            {"$set": {"player2.score": score}}
        )
        
    return jsonify({"success": True}), 200

@learning_bp.route('/api/learning/pvp/quit', methods=['POST'])
def pvp_quit():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.get_json(silent=True)
    if not data or not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
        
    email = data.get('email')
    extensions.pvp_queue_collection.delete_one({"email": email})
    
    extensions.pvp_matches_collection.update_many(
        {"$or": [{"player1.email": email}, {"player2.email": email}], "status": "active"},
        {"$set": {"status": "completed", "quit_by": email}}
    )
    
    return jsonify({"success": True}), 200
