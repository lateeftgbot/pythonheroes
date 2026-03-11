from flask import Blueprint, jsonify, request, current_app, url_for
from .. import extensions
from ..utils import ensure_connection, allowed_file, check_online_status
import os
import datetime
from werkzeug.utils import secure_filename

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/user/profile', methods=['GET'])
def get_profile():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    email = request.args.get('email')
    if not email: return jsonify({"error": "Email required"}), 400
    
    user = extensions.users_collection.find_one({"email": email}, {"password": 0, "_id": 0})
    if not user: return jsonify({"error": "User not found"}), 404
    
    return jsonify(user), 200

@profile_bp.route('/api/user/update-profile', methods=['PATCH'])
def update_profile():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    data = request.json
    email = data.get('email')
    if not email: return jsonify({"error": "Email required"}), 400
    
    update_data = {}
    if 'name' in data: update_data['name'] = data['name']
    if 'bio' in data: update_data['bio'] = data['bio']
    if 'telegram_chat_id' in data: update_data['telegram_chat_id'] = data['telegram_chat_id']
    
    if not update_data: return jsonify({"message": "Nothing to update"}), 200
    
    extensions.users_collection.update_one({"email": email}, {"$set": update_data})
    return jsonify({"status": "updated"}), 200

@profile_bp.route('/api/user/username', methods=['PATCH'])
def update_username():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    data = request.json
    email = data.get('email')
    new_username = data.get('username')
    
    if not email or not new_username: return jsonify({"error": "Missing fields"}), 400
    if len(new_username) < 3: return jsonify({"error": "Username too short"}), 400
    
    # Check uniqueness
    existing = extensions.users_collection.find_one({"username": new_username})
    if existing and existing.get('email') != email:
        return jsonify({"error": "Username taken"}), 409
        
    extensions.users_collection.update_one({"email": email}, {"$set": {"username": new_username}})
    return jsonify({"status": "updated"}), 200

@profile_bp.route('/api/users/search', methods=['GET'])
def search_users():
    if not ensure_connection(): return jsonify([]), 500
    
    query = request.args.get('q', '').strip()
    limit_param = request.args.get('limit', '10')
    current_email = request.args.get('current_email', '').strip()
    
    # Base filter: verified students/admins
    search_filter = {"is_verified": True}
    
    # Exclude current user if provided
    if current_email:
        search_filter["email"] = {"$ne": current_email}
    
    # Apply search query if present
    if query:
        import re
        regex = re.compile(re.escape(query), re.IGNORECASE)
        search_filter["$or"] = [
            {"name": {"$regex": regex}},
            {"username": {"$regex": regex}}
        ]
    
    try:
        limit = 0 if limit_param == 'all' else int(limit_param)
        
        cursor = extensions.users_collection.find(search_filter, {
            "name": 1, 
            "username": 1, 
            "profile_picture": 1, 
            "last_seen": 1,
            "_id": 1
        })
        
        if limit > 0:
            cursor = cursor.limit(limit)
            
        users = []
        for user in cursor:
            users.append({
                "id": str(user['_id']),
                "name": user.get('name'),
                "username": user.get('username') or user.get('name', '').split()[0].lower(),
                "profile_picture": user.get('profile_picture'),
                "is_online": check_online_status(user.get('last_seen'))
            })
            
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@profile_bp.route('/api/users/profile/<username>', methods=['GET'])
def get_public_profile(username):
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    
    # Case insensitive search recommended for username
    import re
    user = extensions.users_collection.find_one({"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}}, {"password": 0})
    if not user: return jsonify({"error": "User not found"}), 404
    
    profile_data = {
        "id": str(user['_id']),
        "email": user.get('email'),
        "name": user.get('name'),
        "username": user.get('username'),
        "profile_picture": user.get('profile_picture'),
        "profile_picture_full": user.get('profile_picture_full'),  # Include full image
        "is_online": check_online_status(user.get('last_seen')),
        "role": user.get('role', 'student'),
        "overall_progress": user.get('overall_progress', 0),
        "modules_completed": user.get('modules_completed', []),
        "bio": user.get('bio', ''),
        "joined_at": user.get('joined_at', datetime.datetime.utcnow().isoformat())
    }
    
    return jsonify(profile_data), 200


@profile_bp.route('/api/user/profile-picture', methods=['POST'])
def upload_profile_picture():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    
    email = request.form.get('email')
    if not email: return jsonify({"error": "Email required"}), 400
    
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and allowed_file(file.filename):
        try:
            import gridfs
            
            fs = gridfs.GridFS(extensions.db)
            filename = secure_filename(file.filename)
            content_type = file.content_type or 'application/octet-stream'
            
            # Save cropped image (avatar)
            file_id = fs.put(file, filename=filename, content_type=content_type, user_email=email, type="avatar")
            pic_url = f"/api/user/image/{str(file_id)}"
            
            update_fields = {"profile_picture": pic_url}

            # Handle original full-size file if present
            if 'original_file' in request.files:
                original_file = request.files['original_file']
                if original_file and allowed_file(original_file.filename):
                    original_filename = secure_filename(f"full_{original_file.filename}")
                    original_content_type = original_file.content_type or 'application/octet-stream'
                    
                    original_file_id = fs.put(original_file, filename=original_filename, content_type=original_content_type, user_email=email, type="full")
                    original_pic_url = f"/api/user/image/{str(original_file_id)}"
                    update_fields["profile_picture_full"] = original_pic_url

            # Update user with potentially both fields
            extensions.users_collection.update_one({"email": email}, {"$set": update_fields})
            
            return jsonify({"status": "uploaded", "profile_picture": pic_url, "profile_picture_full": update_fields.get("profile_picture_full")}), 200
        except Exception as e:
            return jsonify({"error": f"Upload failed: {str(e)}"}), 500
        
    return jsonify({"error": "Invalid file type"}), 400

@profile_bp.route('/api/user/image/<file_id>', methods=['GET'])
def serve_profile_picture(file_id):
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    try:
        import gridfs
        from bson.objectid import ObjectId
        from flask import send_file
        import io
        
        fs = gridfs.GridFS(extensions.db)
        try:
            grid_out = fs.get(ObjectId(file_id))
        except:
             return jsonify({"error": "Image not found"}), 404
             
        return send_file(
            io.BytesIO(grid_out.read()),
            mimetype=grid_out.content_type,
            as_attachment=False,
            download_name=grid_out.filename
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 404
