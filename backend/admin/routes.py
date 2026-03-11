from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from .. import extensions
from ..extensions import mail
from ..utils import ensure_connection, require_admin, check_online_status, get_next_sequence
import os
import uuid
import base64
import mimetypes
import traceback
from bson.objectid import ObjectId

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/user/request-admin', methods=['POST'])
def request_admin():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.get_json(silent=True)
    if not data or not data.get('email'):
        return jsonify({"error": "Email required"}), 400
    email = data.get('email')
    try:
        user = extensions.users_collection.find_one({"email": email})
        if not user: return jsonify({"error": "User not found"}), 404
        user_name = user.get('name', 'N/A')
        user_pic = user.get('profile_picture')
        msg = Message(subject=f"Admin Request: {user_name}", recipients=["lateefolayinka97@gmail.com"])
        has_pic = False
        if user_pic:
            try:
                if user_pic.startswith('data:image'):
                    header, encoded = user_pic.split(",", 1)
                    mime_type = header.split(";")[0].split(":")[1]
                    file_ext = mime_type.split("/")[1]
                    msg.attach(f"profile_pic.{file_ext}", mime_type, base64.b64decode(encoded), headers={'Content-ID': '<profile_pic>'})
                    has_pic = True
            except: pass
        request_id = str(uuid.uuid4())
        token = extensions.serializer.dumps({"email": email, "request_id": request_id}, salt='admin-approval')
        extensions.users_collection.update_one({"email": email}, {"$set": {"active_admin_request_id": request_id}})
        base_url = request.host_url
        if request.headers.get('Origin'): base_url = request.headers.get('Origin') + '/'
        approval_link = f"{base_url}admin/approve/{token}"
        msg.body = f"User {user_name} requested admin.\n\nApprove here: {approval_link}"
        msg.html = f"<h2>Admin Request</h2><p>User: {user_name} ({email})</p><a href='{approval_link}'>Approve Request</a>"
        mail.send(msg)
        return jsonify({"message": "Admin request sent"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/api/admin/grant-master', methods=['POST'])
def grant_master():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.get_json(silent=True)
    if not data or not data.get('email'):
        return jsonify({"error": "Email required"}), 400
    email = data.get('email')
    try:
        user = extensions.users_collection.find_one({"email": email})
        if not user: return jsonify({"error": "User not found"}), 404
        
        # Grant the secret role
        extensions.users_collection.update_one(
            {"email": email}, 
            {"$set": {"role": "master1_vectors"}}
        )
        return jsonify({"message": "Master role granted. Permissions elevated."}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/api/admin/chat/settings', methods=['GET'])
@require_admin
def get_chat_settings():
    if not ensure_connection():
        return jsonify({"is_locked": False}), 200
    settings = extensions.db.settings.find_one({"type": "chat_config"})
    return jsonify({"is_locked": settings.get("is_locked", False) if settings else False}), 200

@admin_bp.route('/api/admin/chat/lock', methods=['POST'])
@require_admin
def toggle_chat_lock():
    if not ensure_connection():
        return jsonify({"error": "DB error"}), 500
    data = request.json
    is_locked = data.get("is_locked", False)
    extensions.db.settings.update_one({"type": "chat_config"}, {"$set": {"is_locked": is_locked}}, upsert=True)
    return jsonify({"status": "updated", "is_locked": is_locked}), 200

@admin_bp.route('/api/admin/chat/clear', methods=['DELETE'])
@require_admin
def clear_chat():
    if not ensure_connection():
        return jsonify({"error": "DB error"}), 500
    extensions.db.messages.delete_many({})
    return jsonify({"status": "cleared"}), 200

@admin_bp.route('/api/admin/users/<user_email>/toggle-status', methods=['POST'])
@require_admin
def admin_toggle_user_status_email(user_email):
    if not ensure_connection():
        return jsonify({"error": "DB error"}), 500
    data = request.json
    is_disabled = data.get("is_disabled", False)
    extensions.users_collection.update_one({"email": user_email}, {"$set": {"is_disabled": is_disabled, "is_active": not is_disabled}})
    return jsonify({"status": "updated", "is_disabled": is_disabled, "is_active": not is_disabled}), 200

@admin_bp.route('/api/admin/approve-request/<token>', methods=['GET', 'POST'])
def approve_admin_request(token):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        payload = extensions.serializer.loads(token, salt='admin-approval', max_age=86400)
        email = payload if isinstance(payload, str) else payload.get('email')
        request_id = None if isinstance(payload, str) else payload.get('request_id')
        
        user = extensions.users_collection.find_one({"email": email})
        if not user: return jsonify({"error": "User no longer exists"}), 404
        if request_id and user.get('active_admin_request_id') != request_id:
            return jsonify({"error": "Approval link invalid or processed"}), 410
            
        if request.method == 'GET':
            return jsonify({"name": user.get('name'), "email": user.get('email'), "username": user.get('username'), "profile_picture": user.get('profile_picture'), "current_role": user.get('role')}), 200
            
        data = request.get_json(silent=True) or {}
        if data.get('action') == 'dismiss':
            extensions.users_collection.update_one({"email": email}, {"$unset": {"active_admin_request_id": ""}})
            return jsonify({"message": "Request dismissed"}), 200
            
        extensions.users_collection.update_one({"email": email}, {"$set": {"role": "admin"}, "$unset": {"active_admin_request_id": ""}})
        return jsonify({"message": f"Granted admin to {user.get('name')}"}), 200
    except:
        return jsonify({"error": "Invalid or expired link"}), 400

@admin_bp.route('/api/admin/users', methods=['GET'])
@require_admin
def get_all_users():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        cursor = extensions.users_collection.find({}, {"password": 0})
        users = []
        for user in cursor:
            users.append({
                "id": str(user.get('_id')),
                "name": user.get('name'),
                "email": user.get('email'),
                "is_verified": user.get('is_verified', False),
                "is_active": user.get('is_active', True),
                "joined_at": user.get('joined_at'),
                "amount_paid": user.get('amount_paid', 0),
                "username": user.get('username'),
                "profile_picture": user.get('profile_picture'),
                "is_online": check_online_status(user.get('last_seen'))
            })
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/api/admin/users/<user_id>', methods=['GET'])
@require_admin
def get_user_detail(user_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    from bson import ObjectId
    user = extensions.users_collection.find_one({"_id": user_id}) or (extensions.users_collection.find_one({"_id": int(user_id)}) if user_id.isdigit() else None) or (extensions.users_collection.find_one({"_id": ObjectId(user_id)}) if ObjectId.is_valid(user_id) else None)
    if not user: return jsonify({"error": "User not found"}), 404
    return jsonify({
        "id": str(user['_id']),
        "name": user.get('name'),
        "email": user.get('email'),
        "is_verified": user.get('is_verified', False),
        "is_active": user.get('is_active', True),
        "joined_at": user.get('joined_at'),
        "amount_paid": user.get('amount_paid', 0),
        "username": user.get('username'),
        "profile_picture": user.get('profile_picture'),
        "telegram_chat_id": user.get('telegram_chat_id'),
        "is_online": check_online_status(user.get('last_seen'))
    }), 200

@admin_bp.route('/api/admin/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    from bson import ObjectId
    user = extensions.users_collection.find_one({"_id": user_id}) or (extensions.users_collection.find_one({"_id": int(user_id)}) if user_id.isdigit() else None) or (extensions.users_collection.find_one({"_id": ObjectId(user_id)}) if ObjectId.is_valid(user_id) else None)
    if not user: return jsonify({"error": "User not found"}), 404
    extensions.users_collection.delete_one({"_id": user['_id']})
    return jsonify({"message": "User deleted"}), 200

@admin_bp.route('/api/admin/users/<user_id>/status', methods=['PATCH'])
@require_admin
def admin_toggle_user_status_id(user_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    from bson import ObjectId
    data = request.json
    new_status = data.get('is_active', True)
    query = {"_id": user_id}
    res = extensions.users_collection.update_one(query, {"$set": {"is_active": new_status, "is_disabled": not new_status}})
    if res.matched_count == 0 and user_id.isdigit():
        res = extensions.users_collection.update_one({"_id": int(user_id)}, {"$set": {"is_active": new_status, "is_disabled": not new_status}})
    if res.matched_count == 0 and ObjectId.is_valid(user_id):
        res = extensions.users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"is_active": new_status, "is_disabled": not new_status}})
    return jsonify({"message": "Status updated"}), 200

@admin_bp.route('/api/admin/migrate-ids', methods=['POST'])
@require_admin
def migrate_user_ids():
    from ..utils import get_next_sequence
    try:
        count = 0
        for user in extensions.users_collection.find({}):
            if len(str(user['_id'])) != 10:
                new_id = get_next_sequence("user_id")
                new_user = user.copy()
                extensions.users_collection.delete_one({"_id": user['_id']})
                new_user['_id'] = new_id
                extensions.users_collection.insert_one(new_user)
                count += 1
        return jsonify({"message": f"Migrated {count} users"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/api/admin/problem-sets', methods=['POST'])
@require_admin
def save_problem_set():
    import datetime
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    if not data or not data.get('name'):
        return jsonify({"error": "Name is required"}), 400
    
    now = datetime.datetime.utcnow().isoformat()
    problem_set = {
        "name": data['name'],
        "description": data.get('description', ''),
        "problems": data.get('problems', []),
        "updated_at": now,
        "created_at": data.get('created_at') or now
    }
    
    try:
        if data.get('id'):
            extensions.problem_sets_collection.update_one(
                {"_id": ObjectId(data['id'])},
                {"$set": problem_set}
            )
            return jsonify({"message": "Problem set updated", "id": data['id']}), 200
        else:
            result = extensions.problem_sets_collection.insert_one(problem_set)
            return jsonify({"message": "Problem set created", "id": str(result.inserted_id)}), 201
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/api/admin/problem-sets', methods=['GET'])
@require_admin
def list_problem_sets():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        sets = list(extensions.problem_sets_collection.find().sort("updated_at", -1))
        for s in sets:
            s['id'] = str(s['_id'])
            del s['_id']
        return jsonify(sets), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route('/api/admin/problem-sets/<set_id>', methods=['DELETE'])
@require_admin
def delete_problem_set(set_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        result = extensions.problem_sets_collection.delete_one({"_id": ObjectId(set_id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Problem set not found"}), 404
        return jsonify({"message": "Problem set deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
