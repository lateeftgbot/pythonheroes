from flask import Blueprint, request, jsonify
from .. import extensions
from ..utils import ensure_connection, check_online_status
import datetime
from datetime import timezone, timedelta
import re
from bson.objectid import ObjectId

chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/api/chat/messages', methods=['GET'])
def get_messages():
    if not ensure_connection():
        return jsonify([]), 200
    try:
        nigerian_tz = timezone(timedelta(hours=1))
        now = datetime.datetime.now(nigerian_tz)
        
        all_messages = list(extensions.db.messages.find().sort("timestamp", 1).limit(100))
        processed_messages = []
        
        for msg in all_messages:
            msg['_id'] = str(msg['_id'])
            if msg.get('is_deleted'):
                deleted_at_str = msg.get('deleted_at')
                if deleted_at_str:
                    deleted_at = datetime.datetime.fromisoformat(deleted_at_str)
                    if now - deleted_at > timedelta(hours=12):
                        # Physical deletion after 12 hours
                        extensions.db.messages.delete_one({"_id": ObjectId(msg['_id'])})
                        continue
                    msg['content'] = "deleted message"
                    msg['is_deleted_masked'] = True
            processed_messages.append(msg)
            
        return jsonify(processed_messages[-50:]), 200
    except Exception as e:
        return jsonify([]), 200

@chat_bp.route('/api/chat/messages', methods=['POST'])
def send_message():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    nigerian_tz = timezone(timedelta(hours=1))
    
    msg = {
        "sender": data.get("sender"),
        "sender_email": data.get("sender_email"),
        "content": data.get("content"),
        "timestamp": datetime.datetime.now(nigerian_tz).isoformat()
    }
    
    try:
        extensions.db.messages.insert_one(msg)
        msg['_id'] = str(msg['_id'])
        return jsonify(msg), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/api/chat/messages/<message_id>', methods=['PUT', 'PATCH'])
def edit_message(message_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    try:
        res = extensions.db.messages.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"content": data.get("content"), "is_edited": True}}
        )
        if res.matched_count == 0:
            extensions.db.direct_messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"content": data.get("content"), "is_edited": True}}
            )
        return jsonify({"status": "edited"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@chat_bp.route('/api/chat/messages/<message_id>', methods=['DELETE'])
def delete_message(message_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        nigerian_tz = timezone(timedelta(hours=1))
        ts = datetime.datetime.now(nigerian_tz).isoformat()
        
        res = extensions.db.messages.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"is_deleted": True, "deleted_at": ts}}
        )
        if res.matched_count == 0:
            extensions.db.direct_messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"is_deleted": True, "deleted_at": ts}}
            )
        return jsonify({"status": "deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@chat_bp.route('/api/chat/username-map', methods=['GET'])
def get_username_map():
    if not ensure_connection():
        return jsonify({}), 200
    try:
        users = list(extensions.users_collection.find(
            {"username": {"$exists": True, "$ne": None}},
            {"name": 1, "username": 1, "profile_picture": 1, "_id": 0}
        ))
        name_to_info = {
            user['name']: {
                'username': user['username'],
                'profile_picture': user.get('profile_picture')
            } 
            for user in users if 'name' in user and 'username' in user
        }
        return jsonify(name_to_info), 200
    except Exception as e:
        return jsonify({}), 200

@chat_bp.route('/api/chat/conversations', methods=['GET'])
def get_conversations():
    if not ensure_connection():
        return jsonify([]), 200
    
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    try:
        my_ids = {email.lower().strip()}
        u = extensions.users_collection.find_one({"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
        if u:
            if u.get('username'): my_ids.add(u.get('username').lower().strip())
            if u.get('name'): my_ids.add(u.get('name').lower().strip())
            if u.get('role') == 'admin': my_ids.add("vectors")
        
        if email.lower() == "lateefolayinka97@gmail.com":
            my_ids.add("vectors")
            my_ids.add("admin")

        id_list = list(my_ids)
        pattern = f"^(?:{'|'.join(map(re.escape, id_list))})$"
        id_pattern = re.compile(pattern, re.IGNORECASE)
        
        query = {
            "$or": [
                {"sender_email": {"$regex": pattern, "$options": "i"}},
                {"sender": {"$regex": pattern, "$options": "i"}},
                {"receiver": {"$regex": pattern, "$options": "i"}}
            ]
        }
        
        msgs = list(extensions.db.direct_messages.find(query).sort("timestamp", -1))
        partner_latest = {}
        
        for m in msgs:
            s_email = str(m.get('sender_email', '')).lower().strip()
            s_name = str(m.get('sender', '')).lower().strip()
            r_id = str(m.get('receiver', '')).lower().strip()
            
            is_sender = id_pattern.match(s_email) or id_pattern.match(s_name)
            is_receiver = id_pattern.match(r_id)
            
            partner_id = None
            if is_receiver:
                partner_id = s_email if s_email else s_name
            elif is_sender:
                partner_id = r_id
                
            if partner_id:
                p_lower = partner_id.lower().strip()
                if p_lower not in my_ids and p_lower not in partner_latest:
                    # Apply masking logic to the last message preview
                    if m.get('is_deleted'):
                        m['content'] = "deleted message"
                    partner_latest[p_lower] = m
                    
        partners_data = []
        seen_emails = set()
        
        for ident in partner_latest:
            msg = partner_latest[ident]
            is_admin_alias = ident in ["vectors", "admin"] or ident == "lateefolayinka97@gmail.com"
            
            partner = extensions.users_collection.find_one({
                "$or": [
                    {"email": {"$regex": f"^{re.escape(ident)}$", "$options": "i"}},
                    {"username": {"$regex": f"^{re.escape(ident)}$", "$options": "i"}},
                    {"name": {"$regex": f"^{re.escape(ident)}$", "$options": "i"}},
                    {"role": "admin"} if is_admin_alias else {"_id": "____NONE____"}
                ]
            }, {"password": 0})
            
            if partner:
                p_email = partner.get('email', '').lower().strip()
                if p_email and p_email not in seen_emails and p_email != email.lower().strip():
                    partners_data.append({
                        "id": str(partner['_id']),
                        "name": partner.get('name'),
                        "email": partner.get('email'),
                        "username": partner.get('username'),
                        "profile_picture": partner.get('profile_picture'),
                        "is_online": check_online_status(partner.get('last_seen')),
                        "last_message": msg.get('content'),
                        "last_message_time": msg.get('timestamp')
                    })
                    seen_emails.add(p_email)
            elif is_admin_alias and "lateefolayinka97@gmail.com" not in seen_emails and email.lower().strip() != "lateefolayinka97@gmail.com":
                partners_data.append({
                    "id": "admin_placeholder",
                    "name": "Vectors Admin",
                    "email": "lateefolayinka97@gmail.com",
                    "username": "vectors",
                    "profile_picture": None,
                    "is_online": True,
                    "last_message": msg.get('content'),
                    "last_message_time": msg.get('timestamp')
                })
                seen_emails.add("lateefolayinka97@gmail.com")
        return jsonify(partners_data), 200
    except Exception as e:
        return jsonify([]), 200

@chat_bp.route('/api/chat/private', methods=['GET'])
def get_private_messages():
    if not ensure_connection():
        return jsonify([]), 200
    user1 = request.args.get('user1')
    user2 = request.args.get('user2')
    if not user1 or not user2:
        return jsonify([]), 400
    try:
        def get_all_ids(identifier):
            if not identifier: return []
            ids = [identifier.lower()]
            u = extensions.users_collection.find_one({
                "$or": [
                    {"email": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
                    {"username": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}},
                    {"name": {"$regex": f"^{re.escape(identifier)}$", "$options": "i"}}
                ]
            })
            if u:
                ids.append(u.get('email', '').lower())
                if u.get('username'): ids.append(u.get('username').lower())
                if u.get('name'): ids.append(u.get('name').lower())
                if u.get('role') == 'admin': ids.append("vectors")
            elif identifier.lower() in ["vectors", "admin"]:
                ids.append("vectors")
                admin = extensions.users_collection.find_one({"role": "admin"})
                if admin: ids.append(admin.get('email', '').lower())
            return list(set(filter(None, ids)))

        ids1 = get_all_ids(user1)
        ids2 = get_all_ids(user2)
        id1_pattern = f"^({'|'.join(map(re.escape, ids1))})$"
        id2_pattern = f"^({'|'.join(map(re.escape, ids2))})$"
        
        messages = list(extensions.db.direct_messages.find({
            "$or": [
                {
                    "$or": [{"sender_email": {"$regex": id1_pattern, "$options": "i"}}, {"sender": {"$regex": id1_pattern, "$options": "i"}}],
                    "receiver": {"$regex": id2_pattern, "$options": "i"}
                },
                {
                    "$or": [{"sender_email": {"$regex": id2_pattern, "$options": "i"}}, {"sender": {"$regex": id2_pattern, "$options": "i"}}],
                    "receiver": {"$regex": id1_pattern, "$options": "i"}
                }
            ]
        }).sort("timestamp", 1))
        
        nigerian_tz = timezone(timedelta(hours=1))
        now = datetime.datetime.now(nigerian_tz)
        processed_messages = []

        for msg in messages:
            msg['_id'] = str(msg['_id'])
            if msg.get('is_deleted'):
                deleted_at_str = msg.get('deleted_at')
                if deleted_at_str:
                    deleted_at = datetime.datetime.fromisoformat(deleted_at_str)
                    if now - deleted_at > timedelta(hours=12):
                        # Physical deletion after 12 hours
                        extensions.db.direct_messages.delete_one({"_id": ObjectId(msg['_id'])})
                        continue
                    msg['content'] = "deleted message"
                    msg['is_deleted_masked'] = True
            processed_messages.append(msg)

        return jsonify(processed_messages), 200
    except Exception as e:
        return jsonify([]), 200

@chat_bp.route('/api/chat/typing', methods=['POST'])
def update_typing_status():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    email = data.get('email')
    typing_to = data.get('typing_to', 'general')
    is_typing = data.get('is_typing', False)
    
    if not email: return jsonify({"error": "Email required"}), 400
    try:
        if is_typing:
            extensions.db.typing_status.update_one(
                {"user_email": email},
                {"$set": {"typing_to": typing_to, "last_typing_at": datetime.datetime.utcnow().isoformat()}},
                upsert=True
            )
        else:
            extensions.db.typing_status.delete_one({"user_email": email})
        return jsonify({"status": "updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/api/chat/typing', methods=['GET'])
def get_typing_status():
    if not ensure_connection():
        return jsonify([]), 200
    typing_to = request.args.get('typing_to', 'general')
    try:
        threshold = (datetime.datetime.utcnow() - datetime.timedelta(seconds=5)).isoformat()
        typers = list(extensions.db.typing_status.find({"typing_to": typing_to, "last_typing_at": {"$gt": threshold}}))
        result = []
        for t in typers:
            u = extensions.users_collection.find_one({"email": t['user_email']}, {"name": 1, "username": 1})
            if u:
                result.append({"email": t['user_email'], "name": u.get('name'), "username": u.get('username') or u.get('name').split()[0].lower()})
        return jsonify(result), 200
    except Exception as e:
        return jsonify([]), 200

@chat_bp.route('/api/chat/read', methods=['POST'])
def mark_messages_as_read():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    reader_email = data.get('reader_email')
    sender_email = data.get('sender_email')
    if not reader_email or not sender_email: return jsonify({"error": "Both emails required"}), 400
    try:
        extensions.db.direct_messages.update_many({"sender_email": sender_email, "receiver": reader_email, "is_read": False}, {"$set": {"is_read": True}})
        return jsonify({"status": "marked_read"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/api/chat/private', methods=['POST'])
def send_private_message():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    nigerian_tz = timezone(timedelta(hours=1))
    msg = {
        "sender": data.get("sender"),
        "sender_email": data.get("sender_email"),
        "receiver": data.get("receiver"),
        "content": data.get("content"),
        "timestamp": datetime.datetime.now(nigerian_tz).isoformat(),
        "is_read": False
    }
    try:
        extensions.db.direct_messages.insert_one(msg)
        msg['_id'] = str(msg['_id'])
        return jsonify(msg), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@chat_bp.route('/api/chat/scroll-position', methods=['POST'])
def save_scroll_position():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    email = data.get('email')
    room_id = data.get('room_id', 'general')
    message_id = data.get('message_id')
    
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    # MongoDB keys cannot contain dots - sanitize room_id (often an email)
    safe_room_id = room_id.replace('.', '_dot_')
        
    try:
        extensions.users_collection.update_one(
            {"email": email},
            {"$set": {f"scroll_positions.{safe_room_id}": message_id}}
        )
        return jsonify({"status": "saved"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@chat_bp.route('/api/chat/scroll-position', methods=['GET'])
def get_scroll_position():
    if not ensure_connection():
        return jsonify({"message_id": None}), 200
    email = request.args.get('email')
    room_id = request.args.get('room_id', 'general')
    
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    safe_room_id = room_id.replace('.', '_dot_')
        
    try:
        user = extensions.users_collection.find_one({"email": email}, {"scroll_positions": 1})
        if user and "scroll_positions" in user:
            msg_id = user["scroll_positions"].get(safe_room_id)
            return jsonify({"message_id": msg_id}), 200
        return jsonify({"message_id": None}), 200
    except Exception as e:
        return jsonify({"message_id": None}), 200
