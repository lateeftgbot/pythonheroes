from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from .. import extensions
from ..extensions import mail
from ..utils import ensure_connection, get_next_sequence
import datetime

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        existing_user = extensions.users_collection.find_one({"email": data['email']})
        if existing_user:
            if existing_user.get('is_verified', False):
                return jsonify({"error": "This email is already registered."}), 409
            extensions.users_collection.delete_one({"_id": existing_user["_id"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    new_user = {
        "name": data['name'],
        "email": data['email'],
        "password": data['password'],
        "username": data['email'].split('@')[0], # Default username from email
        "is_verified": False,
        "is_active": True,
        "joined_at": datetime.datetime.utcnow().isoformat(),
        "amount_paid": 0,
        "telegram_chat_id": data.get('telegram_chat_id'),
        "_id": get_next_sequence("user_id")
    }
    try:
        extensions.users_collection.insert_one(new_user)
    except Exception as e:
        return jsonify({"error": "Failed to create user"}), 500
    
    token = extensions.serializer.dumps(data['email'], salt='email-confirm')
    if not current_app.config.get('MAIL_USERNAME'):
        return jsonify({"message": "Registered (Verification skipped)"}), 201
    
    base_url = request.host_url
    if request.headers.get('Origin'): base_url = request.headers.get('Origin') + '/'
    msg = Message(subject='Confirm Email', sender=current_app.config['MAIL_USERNAME'], recipients=[data['email']])
    msg.body = f"Verification link: {base_url}verify/{token}"
    try:
        mail.send(msg)
    except:
        return jsonify({"message": "Registered, email failed"}), 201
    return jsonify({"message": "Registered successfully"}), 201

@auth_bp.route('/api/verify/<token>', methods=['GET'])
def verify_email(token):
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    try:
        email = extensions.serializer.loads(token, salt='email-confirm', max_age=600)
    except: return jsonify({"error": "Invalid/expired link"}), 400
    user = extensions.users_collection.find_one({"email": email})
    if user:
        extensions.users_collection.update_one({"email": email}, {"$set": {"is_verified": True}})
        return jsonify({"message": "Verified!"}), 200
    return jsonify({"error": "Not found"}), 404

@auth_bp.route('/api/auth/signin', methods=['POST'])
def signin():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    data = request.json
    if data['email'] == "lateefolayinka@gmail.com" and data['password'] == "Lati@001":
        return jsonify({"message": "Admin login", "user": {"name": "Admin", "email": data['email'], "role": "admin", "username": "admin"}}), 200
    user = extensions.users_collection.find_one({"email": data['email'], "password": data['password']})
    if not user: return jsonify({"error": "Invalid credentials"}), 401
    if not user.get('is_verified'): return jsonify({"error": "Verify email"}), 403
    if not user.get('is_active', True): return jsonify({"error": "Deactivated"}), 403
    extensions.users_collection.update_one({"email": data['email']}, {"$set": {"last_seen": datetime.datetime.utcnow().isoformat()}})
    return jsonify({"message": "Login successful", "user": {
        "name": user.get('name'), 
        "email": user['email'], 
        "role": user.get('role', 'student'),
        "username": user.get('username'),
        "ai_usage": user.get('ai_usage', {
            "prompt_tokens": 0,
            "candidates_tokens": 0,
            "total_tokens": 0,
            "request_count": 0
        })
    }}), 200

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    email = request.json.get('email')
    if email: extensions.users_collection.update_one({"email": email}, {"$set": {"last_seen": "2000-01-01T00:00:00"}})
    return jsonify({"status": "logged_out"}), 200

@auth_bp.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    email = request.json.get('email')
    user = extensions.users_collection.find_one({"email": email})
    if not user: return jsonify({"message": "Sent if exists"}), 200
    token = extensions.serializer.dumps(email, salt='password-reset')
    base_url = request.host_url
    if request.headers.get('Origin'): base_url = request.headers.get('Origin') + '/'
    msg = Message(subject='Reset Password', sender=current_app.config['MAIL_USERNAME'], recipients=[email])
    msg.body = f"Reset link: {base_url}reset-password/{token}"
    try:
        mail.send(msg)
        return jsonify({"message": "Sent"}), 200
    except: return jsonify({"error": "Failed"}), 500

@auth_bp.route('/api/auth/reset-password/<token>', methods=['POST'])
def reset_password(token):
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    try:
        email = extensions.serializer.loads(token, salt='password-reset', max_age=900)
    except: return jsonify({"error": "Invalid/expired link"}), 400
    new_password = request.json.get('password')
    extensions.users_collection.update_one({"email": email}, {"$set": {"password": new_password}})
    return jsonify({"message": "Password updated"}), 200

@auth_bp.route('/api/auth/check-username', methods=['POST'])
def check_username():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    username = (request.json.get('username') or "").strip()
    if len(username) < 3: return jsonify({"available": False}), 200
    existing = extensions.users_collection.find_one({"username": username})
    return jsonify({"available": not existing}), 200

@auth_bp.route('/api/auth/heartbeat', methods=['POST'])
def heartbeat():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    email = request.json.get('email')
    
    if email: 
        # Update last_seen
        extensions.users_collection.update_one({"email": email}, {"$set": {"last_seen": datetime.datetime.utcnow().isoformat()}})
        
        # Fetch current user state to sync with frontend
        user = extensions.users_collection.find_one({"email": email})
        if user:
            return jsonify({
                "status": "updated",
                "role": user.get('role', 'student'),
                "is_active": user.get('is_active', True),
                "is_verified": user.get('is_verified', False),
                "ai_usage": user.get('ai_usage', {
                    "prompt_tokens": 0,
                    "candidates_tokens": 0,
                    "total_tokens": 0,
                    "request_count": 0
                })
            }), 200
            
    return jsonify({"status": "updated"}), 200

@auth_bp.route('/api/auth/change-password', methods=['POST'])
def change_password():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    data = request.json
    email = data.get('email')
    current_pass = data.get('current_password')
    new_pass = data.get('new_password')
    
    user = extensions.users_collection.find_one({"email": email})
    if not user: return jsonify({"error": "User not found"}), 404
    
    # In a real app, hash passwords! Here checking plain text as per existing pattern
    if user.get('password') != current_pass:
        return jsonify({"error": "Incorrect current password"}), 400
        
    extensions.users_collection.update_one({"email": email}, {"$set": {"password": new_pass}})
    return jsonify({"message": "Password changed"}), 200

@auth_bp.route('/api/auth/tokens', methods=['GET'])
def get_tokens():
    if not ensure_connection(): return jsonify({"error": "DB error"}), 500
    email = request.args.get('email')
    if not email: return jsonify({"error": "Email required"}), 400
    
    user = extensions.users_collection.find_one({"email": email}, {"ai_usage": 1})
    if not user: return jsonify({"error": "User not found"}), 404
    
    return jsonify(user.get("ai_usage", {
        "prompt_tokens": 0,
        "candidates_tokens": 0,
        "total_tokens": 0,
        "request_count": 0
    })), 200
