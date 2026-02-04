from flask import Flask, request, jsonify, url_for, send_from_directory as from_flask_send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import uuid
from itsdangerous import URLSafeTimedSerializer
import requests
import threading
import re
from functools import wraps

env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env'))
load_dotenv(dotenv_path=env_path)

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, 
            static_folder=os.path.join(basedir, '../dist'),
            static_url_path='/',
            template_folder=os.path.join(basedir, '../dist'))
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
app.config['MONGO_URI'] = os.getenv('MONGO_URI')

# new         new ---------------------------------------------------------------------------------------------------------------A

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False') == 'True'
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME'])


# new         new ---------------------------------------------------------------------------------------------------------------B

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key')

# Initialize extensions
mail = Mail(app)

import certifi
from werkzeug.utils import secure_filename

# Upload Configuration
UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# ... (rest of imports)

# MongoDB Connection
client = None
db = None
users_collection = None

print(f"--- VALIDATING MONGO CONFIG (PID: {os.getpid()}) ---")
uri = app.config['MONGO_URI']

try:
    if uri:
        # Use certifi for SSL certificates as it worked in tests
        client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
        
        # Explicitly use the 'vectors_db' database as requested by the user
        db = client.get_database('vectors_db')
        
        # Verify connection
        client.admin.command('ping')
        print(f"Connected to MongoDB successfully! Database: {db.name} (PID: {os.getpid()})")
        
        users_collection = db.users
    else:
        print("CRITICAL: MONGO_URI is not set in configuration!")
        
except Exception as e:
    print(f"CRITICAL: Error connecting to MongoDB: {e}")


# Global connection variables (already initialized by block above)


def ensure_connection():
    """Ensure MongoDB connection is active and variables are initialized"""
    global client, db, users_collection
    
    # Check if existing connection is alive and fully initialized
    if client and db is not None and users_collection is not None:
        try:
            client.admin.command('ping')
            return True
        except:
            pass # Fall through to reconnection logic
    
    # Reset connection variables to force clean reconnect
    client = None
    db = None
    users_collection = None

    uri = app.config.get('MONGO_URI') or os.getenv('MONGO_URI')
    if not uri:
        print("CRITICAL: MONGO_URI is not set!")
        return False
        
    try:
        import certifi
        client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=20000)
        client.admin.command('ping')
        db = client.get_database('vectors_db')
        users_collection = db.users
        print("MongoDB Connection Re-established Successfully")
        return True
    except Exception as e:
        print(f"CRITICAL: Failed to connect to MongoDB: {e}")
        return False

# Helper functions 


# Token serializer for email verification
serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])

def require_admin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # In a real app, we'd check a JWT token or session.
        # For this implementation, we expect 'admin_email' in headers or query params
        # (Simplified for the current architecture of this specific app)
        admin_email = request.headers.get('X-Admin-Email') or request.args.get('admin_email')
        
        if admin_email != "pythonheroesacademy@gmail.com":
            return jsonify({"error": "Unauthorized: Admin access required"}), 403
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({"error": "API route not found"}), 404
    return app.send_static_file('index.html')

@app.errorhandler(500)
def handle_500(e):
    import traceback
    error_details = str(e)
    if app.debug:
        error_details = traceback.format_exc()
    return jsonify({
        "error": "Internal Server Error",
        "message": str(e),
        "details": error_details if app.debug else None
    }), 500

@app.errorhandler(Exception)
def handle_exception(e):
    import traceback
    print(f"UNHANDLED EXCEPTION: {e}")
    traceback.print_exc()
    return jsonify({
        "error": "Unexpected Error",
        "message": str(e)
    }), 500

@app.route('/api/debug/info', methods=['GET'])
def debug_info():
    """Return diagnostic info about the backend"""
    return jsonify({
        "status": "active",
        "db_connected": db is not None,
        "users_collection": users_collection is not None,
        "env": {
            "MONGO_URI_SET": os.getenv('MONGO_URI') is not None,
            "MAIL_SERVER": app.config.get('MAIL_SERVER')
        }
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "Python Heroes Backend"})

@app.route('/api/test/ping-bot', methods=['GET', 'POST'])
def ping_bot():
    """Test route to ping the Telegram bot website manually"""
    bot_url = "https://pythonheroes.onrender.com/api/payment-intent"
    test_payload = {
        "email": "test-ping@pythonheroes.com",
        "name": "Test Ping User",
        "amount": 3000,
        "status": "test_ping"
    }
    
    try:
        print(f"DEBUG: Pinging bot at {bot_url}...")
        response = requests.post(bot_url, json=test_payload, timeout=10)
        return jsonify({
            "status": "ping_sent",
            "bot_url": bot_url,
            "response_code": response.status_code,
            "response_body": response.text
        }), 200
    except Exception as e:
        print(f"CRITICAL: Failed to ping bot: {str(e)}")
        return jsonify({
            "status": "failed",
            "error": str(e)
        }), 500

@app.route('/api/track-tg-visit', methods=['POST'])
def track_tg_visit():
    """Endpoint to log and potentially update user ID to Telegram chat ID"""
    data = request.json
    chat_id = str(data.get('chatId'))
    email = data.get('email') # Optional: if user is logged in or identified
    
    print(f"TELEGRAM: User arrived from Telegram. Chat ID: {chat_id}")
    
    if email and chat_id:
        try:
            user = users_collection.find_one({"email": email})
            if user and str(user['_id']) != chat_id:
                print(f"TELEGRAM: Updating user {email} ID from {user['_id']} to {chat_id}")
                # _id is immutable, must re-insert
                old_user = user.copy()
                users_collection.delete_one({"_id": user['_id']})
                old_user['_id'] = chat_id
                old_user['telegram_chat_id'] = chat_id
                users_collection.insert_one(old_user)
                return jsonify({"status": "updated", "new_id": chat_id}), 200
        except Exception as e:
            print(f"TELEGRAM: Failed to update user ID: {e}")
            
    return jsonify({"status": "logged"}), 200

@app.route('/api/notify-bot', methods=['POST'])
def notify_bot_proxy():
    """Proxy route to send notifications to the bot website instantly (asynchronously)"""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    status = data.get('status', 'intent')
    endpoint = "payment-success" if status == "success" else "payment-intent"
    bot_url = f"https://pythonheroes.onrender.com/api/{endpoint}"
    
    def send_async_notification(url, payload):
        try:
            # We still use a timeout in the background so the thread doesn't hang forever
            requests.post(url, json=payload, timeout=60)
            print(f"DEBUG: Background notification sent to {url}")
        except Exception as e:
            print(f"ERROR: Background bot notification failed: {str(e)}")

    # Fire and forget: start a background thread and return immediately
    threading.Thread(target=send_async_notification, args=(bot_url, data)).start()
    
    return jsonify({"status": "processing_in_background"}), 200

def get_next_sequence(sequence_name):
    """Get next sequence number for user IDs starting from 0123456789"""
    global db
    if db is None:
        return None
    
    # Initialize counter if it doesn't exist
    counters = db.counters
    counter = counters.find_one({"_id": sequence_name})
    if not counter:
        counters.insert_one({"_id": sequence_name, "seq": 123456788})
    
    result = counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"seq": 1}},
        return_document=True
    )
    
    # Format as 10-digit string with leading zero if needed
    return f"{result['seq']:010d}"

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500

    data = request.json
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if user already exists

    
    # Dual-State Email Check: Verified vs Unverified
    try:
        existing_user = users_collection.find_one({"email": data['email']})
        if existing_user:
            if existing_user.get('is_verified', False):
                # Only block if already verified
                print(f"Signup blocked: {data['email']} is already verified.")
                return jsonify({"error": "This email is already registered and verified."}), 409
            else:
                # If unverified, we 'forget' the old registration and allow a fresh one
                print(f"Overwriting unverified registration for: {data['email']}")
                users_collection.delete_one({"_id": existing_user["_id"]})
    except Exception as e:
        print(f"Database error checking user: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    import datetime
    # Create user document
    new_user = {
        "name": data['name'],
        "email": data['email'],
        "password": data['password'], # In production, hash this!
        "is_verified": False,
        "is_active": True,
        "joined_at": datetime.datetime.utcnow().isoformat(),
        "amount_paid": 0,
        "telegram_chat_id": data.get('telegram_chat_id'), # Save the chat ID if provided
        "_id": get_next_sequence("user_id")
    }
    
    try:
        users_collection.insert_one(new_user)
    except Exception as e:
        print(f"Database insert error: {e}")
        return jsonify({"error": "Failed to create user"}), 500
    
    # Generate verification token
    token = serializer.dumps(data['email'], salt='email-confirm')
    
    # Send verification email
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("Mail credentials missing, skipping email.")
        return jsonify({
            "message": "User registered (Email verification skipped due to missing config).",
            "user": {
                "name": data['name'],
                "email": data['email']
            }
        }), 201


   # msg = Message('Confirm your Email', sender=app.config['MAIL_USERNAME'], recipients=[data['email']])
    
    # Construct Link
    base_url = request.host_url
    if request.headers.get('Origin'):
        base_url = request.headers.get('Origin') + '/'
        
    msg = Message(subject='Confirm your Email', sender=app.config['MAIL_USERNAME'], recipients=[data['email']])
    link = f"{base_url}verify/{token}"
    msg.body = f'Your verification link is: {link}\n\nPlease click the link above to verify your account. This link expires in 10 minutes.'
    
    try:
        mail.send(msg)
    except Exception as e:
        import traceback
        print(f"CRITICAL: Error sending email to {data['email']}: {str(e)}")
        traceback.print_exc()
        # Don't fail the registration if email fails, but let user know
        return jsonify({
            "message": "User registered, but verification email failed to send. Please contact support. Internal Error: " + str(e),
            "user": {
                "name": data['name'],
                "email": data['email']
            }
        }), 201
    
    return jsonify({
        "message": "User registered successfully. Please check your email to verify your account.",
        "user": {
            "name": data['name'],
            "email": data['email']
        }
    }), 201

@app.route('/api/verify/<token>', methods=['GET'])
def verify_email(token):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    try:
        # Load email from token with 10 minute expiration (600 seconds)
        email = serializer.loads(token, salt='email-confirm', max_age=600)
    except Exception as e:
        return jsonify({"error": "The confirmation link is invalid or has expired."}), 400
    
    user = users_collection.find_one({"email": email})
    
    if user:
        if user.get('is_verified'):
            return jsonify({
                "message": "Account already verified. You can login now.",
                "name": user.get('name', 'Hero')
            }), 200
        
        users_collection.update_one({"email": email}, {"$set": {"is_verified": True}})
        return jsonify({
            "message": "Account verified! You can now login.",
            "name": user.get('name', 'Hero')
        }), 200
    else:
        return jsonify({"error": "User not found."}), 404


@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.get_json(silent=True)
    if not data or not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
        
    email = data['email']
    user = users_collection.find_one({"email": email})
    
    if not user:
        return jsonify({"message": "If an account exists, a reset email has been sent."}), 200
        
    # Generate token
    token = serializer.dumps(email, salt='password-reset')
    
    # Construct Link
    base_url = request.host_url
    if request.headers.get('Origin'):
        base_url = request.headers.get('Origin') + '/'
        
    link = f"{base_url}reset-password/{token}"
    
    msg = Message(subject='Password Reset Request', sender=app.config['MAIL_USERNAME'], recipients=[email])
    msg.body = f"Click the link below to reset your password. This link expires in 15 minutes.\n\n{link}"
    
    try:
        mail.send(msg)
        return jsonify({"message": "Password reset email sent."}), 200
    except Exception as e:
        print(f"Mail Error: {e}")
        return jsonify({"error": "Failed to send email. Check server logs."}), 500

@app.route('/api/auth/reset-password/<token>', methods=['POST'])
def reset_password(token):
    # Pass verbose=True if we modified ensure_connection (not doing that yet),
    # but let's try-catch the entire block to be safe.
    try:
        if not ensure_connection():
            # Try to force reconnect and get specific error
            global client, db, users_collection
            uri = app.config.get('MONGO_URI') or os.getenv('MONGO_URI')
            if not uri:
                return jsonify({"error": "Database connection failed: MONGO_URI not found"}), 500
            try:
                import certifi
                test_client = MongoClient(uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
                test_client.admin.command('ping')
            except Exception as conn_err:
                 return jsonify({"error": f"Database connection failed: {str(conn_err)}"}), 500
            
            return jsonify({"error": "Database connection failed (Unknown reason, but ping failed)"}), 500
            
        try:
            email = serializer.loads(token, salt='password-reset', max_age=900) # 15 mins
        except Exception as e:
            return jsonify({"error": f"Invalid or expired link: {str(e)}"}), 400
            
        data = request.get_json(silent=True)
        new_password = data.get('password')
        
        if not new_password:
            return jsonify({"error": "New password is required"}), 400
            
        # Update password
        result = users_collection.update_one({"email": email}, {"$set": {"password": new_password}})
        
        if result.matched_count == 0:
             return jsonify({"error": "User not found for this email"}), 404
        
        return jsonify({"message": "Password updated successfully. You can now login."}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Server Error: {str(e)}"}), 500


# --- Chat API ---
@app.route('/api/chat/messages', methods=['GET'])
def get_messages():
    if not ensure_connection():
        return jsonify([]), 200
    try:
        import datetime
        from datetime import timezone, timedelta
        nigerian_tz = timezone(timedelta(hours=1))
        now = datetime.datetime.now(nigerian_tz)
        
        # Get last 50 messages
        all_messages = list(db.messages.find().sort("timestamp", 1).limit(100))
        processed_messages = []
        
        for msg in all_messages:
            msg['_id'] = str(msg['_id'])
            
            # Check if deleted
            if msg.get('is_deleted'):
                deleted_at_str = msg.get('deleted_at')
                if deleted_at_str:
                    deleted_at = datetime.datetime.fromisoformat(deleted_at_str)
                    # If more than 12 hours ago, skip
                    if now - deleted_at > timedelta(hours=12):
                        continue
                    # Else, mask content
                    msg['content'] = "deleted message"
                    msg['is_deleted_masked'] = True
            
            processed_messages.append(msg)
            
        return jsonify(processed_messages[-50:]), 200
    except Exception as e:
        print(f"Chat Fetch Error: {e}")
        return jsonify([]), 200

@app.route('/api/chat/messages', methods=['POST'])
def send_message():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    import datetime
    from datetime import timezone, timedelta
    
    # Create GMT+1 (Nigerian time) timezone
    nigerian_tz = timezone(timedelta(hours=1))
    
    msg = {
        "sender": data.get("sender"),
        "sender_email": data.get("sender_email"), # Add this
        "content": data.get("content"),
        "timestamp": datetime.datetime.now(nigerian_tz).isoformat()
    }
    
    try:
        db.messages.insert_one(msg)
        msg['_id'] = str(msg['_id'])
        return jsonify(msg), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/messages/<message_id>', methods=['PUT', 'PATCH'])
def edit_message(message_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    try:
        from bson.objectid import ObjectId
        # Try general chat first
        res = db.messages.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"content": data.get("content"), "is_edited": True}}
        )
        if res.matched_count == 0:
            # Try private chat
            db.direct_messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"content": data.get("content"), "is_edited": True}}
            )
        return jsonify({"status": "edited"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/chat/messages/<message_id>', methods=['DELETE'])
def delete_message(message_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        import datetime
        from datetime import timezone, timedelta
        from bson.objectid import ObjectId
        nigerian_tz = timezone(timedelta(hours=1))
        ts = datetime.datetime.now(nigerian_tz).isoformat()
        
        # Try general chat
        res = db.messages.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"is_deleted": True, "deleted_at": ts}}
        )
        if res.matched_count == 0:
            # Try private chat
            db.direct_messages.update_one(
                {"_id": ObjectId(message_id)},
                {"$set": {"is_deleted": True, "deleted_at": ts}}
            )
        return jsonify({"status": "deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/chat/username-map', methods=['GET'])
def get_username_map():
    """Get mapping of full names to usernames for chat display"""
    if not ensure_connection():
        return jsonify({}), 200
    
    try:
        # Get all users with usernames
        users = list(users_collection.find(
            {"username": {"$exists": True, "$ne": None}},
            {"name": 1, "username": 1, "_id": 0}
        ))
        
        # Create mapping: full name -> username
        name_to_username = {user['name']: user['username'] for user in users if 'name' in user and 'username' in user}
        
        return jsonify(name_to_username), 200
    except Exception as e:
        print(f"Username map error: {e}")
        return jsonify({}), 200

# --- Private Chat APIs ---



@app.route('/api/chat/conversations', methods=['GET'])
def get_conversations():
    if not ensure_connection():
        return jsonify([]), 200
    
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    try:
        # 1. Gather all possible IDs for the current user
        my_ids = {email.lower().strip()}
        u = users_collection.find_one({"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
        if u:
            if u.get('username'): my_ids.add(u.get('username').lower().strip())
            if u.get('name'): my_ids.add(u.get('name').lower().strip())
            if u.get('role') == 'admin': my_ids.add("vectors")
        
        if email.lower() == "pythonheroesacademy@gmail.com":
            my_ids.add("vectors")
            my_ids.add("admin")

        # 2. Find ALL messages where this user is either sender or receiver
        # Using a broader regex to capture all involvement
        id_list = list(my_ids)
        pattern = f"^(?:{'|'.join(map(re.escape, id_list))})$"
        id_pattern = re.compile(pattern, re.IGNORECASE)
        
        # Note: We check sender_email, sender, and receiver
        query = {
            "$or": [
                {"sender_email": {"$regex": pattern, "$options": "i"}},
                {"sender": {"$regex": pattern, "$options": "i"}},
                {"receiver": {"$regex": pattern, "$options": "i"}}
            ]
        }
        
        # Pull messages from direct_messages collection
        msgs = list(db.direct_messages.find(query).sort("timestamp", -1))
        
        partner_latest = {} # partner_id -> message object
        
        for m in msgs:
            s_email = str(m.get('sender_email', '')).lower().strip()
            s_name = str(m.get('sender', '')).lower().strip()
            r_id = str(m.get('receiver', '')).lower().strip()
            
            # Determine who the 'other' person is
            is_sender = id_pattern.match(s_email) or id_pattern.match(s_name)
            is_receiver = id_pattern.match(r_id)
            
            partner_id = None
            if is_receiver:
                # If I am receiver, partner is sender
                partner_id = s_email if s_email else s_name
            elif is_sender:
                # If I am sender, partner is receiver
                partner_id = r_id
                
            if partner_id:
                p_lower = partner_id.lower().strip()
                # Skip if partner is actually just another one of my IDs (self-chat)
                if p_lower not in my_ids and p_lower not in partner_latest:
                    partner_latest[p_lower] = m
                    
        # 3. Resolve partner IDs to User objects
        partners_data = []
        seen_emails = set()
        
        for ident, msg in partner_latest.items():
            is_admin_alias = ident in ["vectors", "admin"] or ident == "pythonheroesacademy@gmail.com"
            
            partner = users_collection.find_one({
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
            elif is_admin_alias and "pythonheroesacademy@gmail.com" not in seen_emails and email.lower().strip() != "pythonheroesacademy@gmail.com":
                partners_data.append({
                    "id": "admin_placeholder",
                    "name": "Vectors Admin",
                    "email": "pythonheroesacademy@gmail.com",
                    "username": "vectors",
                    "profile_picture": None,
                    "is_online": True,
                    "last_message": msg.get('content'),
                    "last_message_time": msg.get('timestamp')
                })
                seen_emails.add("pythonheroesacademy@gmail.com")
                
        return jsonify(partners_data), 200
        
    except Exception as e:
        import traceback
        print(f"CONVERSATIONS ERROR: {e}")
        traceback.print_exc()
        return jsonify([]), 200

@app.route('/api/chat/private', methods=['GET'])
def get_private_messages():
    if not ensure_connection():
        return jsonify([]), 200
    user1 = request.args.get('user1') # email or username
    user2 = request.args.get('user2') # email or username
    if not user1 or not user2:
        return jsonify([]), 400
    try:
        # Get identifiers for both users to find all messages between them
        def get_all_ids(identifier):
            if not identifier: return []
            ids = [identifier.lower()]
            # Seek user by any identifier
            u = users_collection.find_one({
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
                # Also find the actual admin user to get their email
                admin = users_collection.find_one({"role": "admin"})
                if admin: 
                    ids.append(admin.get('email', '').lower())
                    if admin.get('username'): ids.append(admin.get('username').lower())
            return list(set(filter(None, ids)))

        ids1 = get_all_ids(user1)
        ids2 = get_all_ids(user2)
        
        # Build optimized regex pattern for $in matching (emulation)
        id1_pattern = f"^({'|'.join(map(re.escape, ids1))})$"
        id2_pattern = f"^({'|'.join(map(re.escape, ids2))})$"
        
        messages = list(db.direct_messages.find({
            "$or": [
                {
                    "$or": [
                        {"sender_email": {"$regex": id1_pattern, "$options": "i"}},
                        {"sender": {"$regex": id1_pattern, "$options": "i"}}
                    ],
                    "receiver": {"$regex": id2_pattern, "$options": "i"}
                },
                {
                    "$or": [
                        {"sender_email": {"$regex": id2_pattern, "$options": "i"}},
                        {"sender": {"$regex": id2_pattern, "$options": "i"}}
                    ],
                    "receiver": {"$regex": id1_pattern, "$options": "i"}
                }
            ]
        }).sort("timestamp", 1))
        for msg in messages:
            msg['_id'] = str(msg['_id'])
        return jsonify(messages), 200
    except Exception as e:
        return jsonify([]), 200

@app.route('/api/chat/typing', methods=['POST'])
def update_typing_status():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    email = data.get('email')
    typing_to = data.get('typing_to', 'general') # partner email or 'general'
    is_typing = data.get('is_typing', False)
    
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    try:
        import datetime
        if is_typing:
            db.typing_status.update_one(
                {"user_email": email},
                {"$set": {
                    "typing_to": typing_to,
                    "last_typing_at": datetime.datetime.utcnow().isoformat()
                }},
                upsert=True
            )
        else:
            db.typing_status.delete_one({"user_email": email})
            
        return jsonify({"status": "updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/typing', methods=['GET'])
def get_typing_status():
    if not ensure_connection():
        return jsonify([]), 200
        
    typing_to = request.args.get('typing_to', 'general')
    
    try:
        import datetime
        from datetime import timedelta
        # Threshold: 5 seconds
        threshold = (datetime.datetime.utcnow() - timedelta(seconds=5)).isoformat()
        
        # Find people typing to this target who were active recently
        query = {
            "typing_to": typing_to,
            "last_typing_at": {"$gt": threshold}
        }
        
        typers = list(db.typing_status.find(query))
        result = []
        for t in typers:
            # Get user info for display
            u = users_collection.find_one({"email": t['user_email']}, {"name": 1, "username": 1})
            if u:
                result.append({
                    "email": t['user_email'],
                    "name": u.get('name'),
                    "username": u.get('username') or u.get('name').split()[0].lower()
                })
        
        return jsonify(result), 200
    except Exception as e:
        print(f"TYPING FETCH ERROR: {e}")
        return jsonify([]), 200

@app.route('/api/chat/read', methods=['POST'])
def mark_messages_as_read():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    reader_email = data.get('reader_email')
    sender_email = data.get('sender_email')
    
    if not reader_email or not sender_email:
        return jsonify({"error": "Both emails required"}), 400
        
    try:
        # Mark all messages from sender to reader as read
        db.direct_messages.update_many(
            {"sender_email": sender_email, "receiver": reader_email, "is_read": False},
            {"$set": {"is_read": True}}
        )
        return jsonify({"status": "marked_read"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat/private', methods=['POST'])
def send_private_message():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    import datetime
    from datetime import timezone, timedelta
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
        db.direct_messages.insert_one(msg)
        msg['_id'] = str(msg['_id'])
        return jsonify(msg), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Admin Chat Controls ---

@app.route('/api/admin/chat/settings', methods=['GET'])
@require_admin
def get_chat_settings():
    if not ensure_connection():
        return jsonify({"is_locked": False}), 200
    settings = db.settings.find_one({"type": "chat_config"})
    if not settings:
        return jsonify({"is_locked": False}), 200
    return jsonify({"is_locked": settings.get("is_locked", False)}), 200

@app.route('/api/admin/chat/lock', methods=['POST'])
@require_admin
def toggle_chat_lock():
    if not ensure_connection():
        return jsonify({"error": "DB error"}), 500
    data = request.json
    is_locked = data.get("is_locked", False)
    db.settings.update_one(
        {"type": "chat_config"},
        {"$set": {"is_locked": is_locked}},
        upsert=True
    )
    return jsonify({"status": "updated", "is_locked": is_locked}), 200

@app.route('/api/admin/chat/clear', methods=['DELETE'])
@require_admin
def clear_chat():
    if not ensure_connection():
        return jsonify({"error": "DB error"}), 500
    db.messages.delete_many({})
    return jsonify({"status": "cleared"}), 200

@app.route('/api/admin/users/<user_email>/toggle-status', methods=['POST'])
@require_admin
def admin_toggle_user_status_email(user_email):
    if not ensure_connection():
        return jsonify({"error": "DB error"}), 500
    data = request.json
    is_disabled = data.get("is_disabled", False)
    # Sync is_active with is_disabled (active = not disabled)
    is_active = not is_disabled
    users_collection.update_one(
        {"email": user_email},
        {"$set": {"is_disabled": is_disabled, "is_active": is_active}}
    )
    return jsonify({"status": "updated", "is_disabled": is_disabled, "is_active": is_active}), 200

@app.route('/api/auth/signin', methods=['POST'])
def signin():
    try:
        if not ensure_connection():
            return jsonify({"error": "Database connection failed"}), 500

        # Safely parse JSON to avoid crashes on malformed requests
        data = request.get_json(silent=True)
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Missing email or password"}), 400
        
        # Admin Login Check (Updated with new credentials)
        if data['email'] == "pythonheroesacademy@gmail.com" and data['password'] == "Lati@001":
            return jsonify({
                "message": "Admin login successful",
                "user": {
                    "name": "Admin",
                    "email": "pythonheroesacademy@gmail.com",
                    "role": "admin"
                }
            }), 200

        # Find user
        user = users_collection.find_one({"email": data['email'], "password": data['password']})
        
        if not user:
            return jsonify({"error": "Invalid credentials"}), 401
        
        if not user.get('is_verified'):
            # Check if this user just expired
            # if cleanup_expired_unverified_users(user['email']):  # DISABLED: Function not defined
            #      return jsonify({"error": "Your verification link expired (10 min limit). Your account has been removed. Please sign up again."}), 403
            return jsonify({"error": "Please verify your email address first"}), 403
        
        # Update last_seen on login
        import datetime
        try:
            users_collection.update_one(
                {"email": data['email']},
                {"$set": {"last_seen": datetime.datetime.utcnow().isoformat()}}
            )
        except Exception as update_err:
            print(f"Warning: Failed to update last_seen: {update_err}")

        if user.get('is_active', True) is False:
            return jsonify({"error": "This account has been deactivated. Contact admin."}), 403

        return jsonify({
            "message": "Login successful",
            "user": {
                "name": user.get('name', 'User'),
                "email": user.get('email'),
                "role": "student",
                "telegram_chat_id": user.get('telegram_chat_id'),
                "username": user.get('username'),
                "profile_picture": user.get('profile_picture')
            }
        }), 200
    except Exception as e:
        # Catch-all for any unexpected errors within the route
        print(f"SignIn CRITICAL Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# --- User Profile APIs ---

@app.route('/api/user/profile', methods=['GET'])
def get_current_user_profile():
    """Get current user's profile - in production, use session/token"""
    # For now, we'll expect email in query params
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    try:
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Get username with fallback
        username = user.get('username')
        if not username and user.get('name'):
            username = user.get('name').split()[0].lower()
            
        return jsonify({
            "name": user.get('name'),
            "email": user.get('email'),
            "username": username,
            "telegram_chat_id": user.get('telegram_chat_id'),
            "profile_picture": user.get('profile_picture'),
            "is_online": check_online_status(user.get('last_seen'))
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/username', methods=['PATCH'])
def update_username():
    """Update user's display username for chat"""
    data = request.json
    if not data or not data.get('email') or not data.get('username'):
        return jsonify({"error": "Email and username required"}), 400
    
    username = data['username'].strip()
    email = data['email']
    print(f"DEBUG: Attempting to update username to '{username}' for {email}") 
    
    # Validate username
    import re
    if not re.match(r'^[a-zA-Z0-9_-]{3,20}$', username):
        return jsonify({"error": "Username must be 3-20 characters (letters, numbers, _, - only)"}), 400

    # Reserved words check
    reserved_words = ["admin", "administrator", "root", "system", "vectors", "support", "staff", "mod", "moderator"]
    if username.lower() in reserved_words or "admin" in username.lower() or "vectors" in username.lower():
         return jsonify({"error": "This username is reserved"}), 409
    
    try:
        # Get user's current display name BEFORE update to find their old messages
        current_user_doc = users_collection.find_one({"email": email})
        if not current_user_doc:
            return jsonify({"error": "User not found"}), 404
            
        old_display_name = current_user_doc.get('username') or current_user_doc.get('name')

        # Check if username is already taken (case-insensitive)
        existing = users_collection.find_one({
            "username": {"$regex": f"^{re.escape(username)}$", "$options": "i"},
            "email": {"$ne": email}  # Exclude current user
        })
        
        if existing:
            return jsonify({"error": "This username is not available"}), 409
        
        # Update username
        result = users_collection.update_one(
            {"email": email},
            {"$set": {"username": username}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        # Retroactive Message Update: Update all past messages from this user
        if old_display_name:
            db.messages.update_many(
                {"sender": old_display_name},
                {"$set": {"sender": username}}
            )
        
        return jsonify({
            "message": "Username updated successfully",
            "username": username
        }), 200
    except Exception as e:
        print(f"Username update error: {e}")
        return jsonify({"error": "Failed to update username"}), 500

@app.route('/api/user/update-profile', methods=['PATCH'])
def update_profile():
    """Update user's name and bio"""
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    data = request.json
    if not data or not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
        
    email = data.get('email')
    update_data = {}
    
    if 'name' in data:
        update_data['name'] = data['name'].strip()
    if 'bio' in data:
        update_data['bio'] = data['bio'].strip()
        
    if not update_data:
        return jsonify({"message": "No changes provided"}), 200
        
    try:
        result = users_collection.update_one(
            {"email": email},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "message": "Profile updated successfully",
            "updated_fields": list(update_data.keys())
        }), 200
    except Exception as e:
        print(f"Profile update error: {e}")
        return jsonify({"error": "Failed to update profile"}), 500

@app.route('/api/auth/check-username', methods=['POST'])
def check_username_availability():
    """Check if a username is available (real-time feedback)"""
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    data = request.get_json(silent=True)
    username = (data.get('username') or "").strip()
    current_email = data.get('email') # Optional: to exclude self
    
    if not username or len(username) < 3:
        return jsonify({"available": False, "error": "Too short"}), 200

    # Reserved words check
    reserved_words = ["admin", "administrator", "root", "system", "vectors", "support", "staff", "mod", "moderator"]
    if username.lower() in reserved_words or "admin" in username.lower() or "vectors" in username.lower():
         return jsonify({"available": False, "error": "This username is reserved"}), 200
        
    try:
        import re
        query = {"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}}
        if current_email:
            query["email"] = {"$ne": current_email}
            
        existing = users_collection.find_one(query)
        if existing:
            return jsonify({"available": False, "error": "This username is not available"}), 200
            
        return jsonify({"available": True}), 200
    except Exception as e:
        return jsonify({"available": False, "error": str(e)}), 500

@app.route('/api/auth/heartbeat', methods=['POST'])
def update_heartbeat():
    """Update last_seen for the logged-in user"""
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Missing email"}), 400
        
    try:
        import datetime
        now = datetime.datetime.utcnow().isoformat()
        users_collection.update_one(
            {"email": email},
            {"$set": {"last_seen": now}}
        )
        return jsonify({"status": "updated", "last_seen": now}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Code Project APIs ---

@app.route('/api/code/save', methods=['POST'])
def save_code_project():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    data = request.json
    print(f"DEBUG: Save project request received for email: {data.get('email')}")
    if not data or not data.get('email') or not data.get('code'):
        print(f"DEBUG: Save failed - missing fields. Data: {data}")
        return jsonify({"error": "Email and code are required"}), 400
        
    email = data['email']
    title = (data.get('title') or 'Untitled Project').strip()
    code = data['code']
    language = data.get('language', 'python')
    folder = data.get('folder', 'Python Heroes/Projects')
    print(f"DEBUG: Saving project with title: '{title}' in folder: '{folder}'")
    
    try:
        import datetime
        import re
        
        # Robust increment logic
        # 1. Extract base title (remove any trailing numbers)
        # Matches "Project", "Project 2", "Project 22"
        # We look for a space followed by digits at the end
        match = re.search(r'^(.*?)(?:\s+(\d+))?$', title)
        if match:
            base_title = match.group(1).strip()
        else:
            base_title = title
            
        print(f"DEBUG: Base title identified as: '{base_title}'")
            
        # 2. Find ALL current titles for this user that match the base pattern
        # Pattern: exact base title OR base title + space + digits
        regex_pattern = f"^{re.escape(base_title)}(\\s+\\d+)?$"
        existing_projects = list(db.code_projects.find({
            "email": email,
            "title": {"$regex": regex_pattern, "$options": "i"}
        }))
        
        final_title = title
        if existing_projects:
            # If the specific title they asked for exists, or we just want to find the next available number
            # User wants "Project 2", "Project 3" etc.
            # We find the maximum number currently used for this base
            max_num = 1
            specific_exists = False
            
            for p in existing_projects:
                p_title = p['title']
                if p_title.lower() == title.lower():
                    specific_exists = True
                
                # Check for numeric suffix
                m = re.search(r'\s+(\d+)$', p_title)
                if m:
                    max_num = max(max_num, int(m.group(1)))
                elif p_title.lower() == base_title.lower():
                    # The base title exists without a number, count it as "1"
                    max_num = max(max_num, 1)
            
            if specific_exists:
                # Increment from the max number found
                final_title = f"{base_title} {max_num + 1}"
            else:
                # They chose a unique title (perhaps with a manual number high enough), use it
                final_title = title

        project = {
            "email": email,
            "title": final_title,
            "code": code,
            "language": language,
            "folder": folder,
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        
        db.code_projects.insert_one(project)
        print(f"DEBUG: Project saved successfully as: '{final_title}'")
        
        return jsonify({
            "message": "Project saved successfully",
            "title": final_title
        }), 200
    except Exception as e:
        print(f"DEBUG: Save project exception: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/code/list', methods=['GET'])
def list_code_projects():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
        
    try:
        cursor = db.code_projects.find({"email": email}).sort("updated_at", -1)
        projects = []
        for p in cursor:
            projects.append({
                "id": str(p.get('_id')),
                "title": p.get("title"),
                "language": p.get("language"),
                "folder": p.get("folder", "Python Heroes/Projects"),
                "updated_at": p.get("updated_at"),
                "code": p.get("code")
            })
            
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return from_flask_send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/user/profile-picture', methods=['POST'])
def upload_profile_picture():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500

    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    email = request.form.get('email')

    if not file or file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    if file and allowed_file(file.filename):
        try:
            filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            # Update user profile
            profile_pic_url = f"/uploads/{filename}"
            users_collection.update_one(
                {"email": email},
                {"$set": {"profile_picture": profile_pic_url}}
            )

            return jsonify({
                "message": "Profile picture updated",
                "profile_picture": profile_pic_url
            }), 200
        except Exception as e:
            print(f"Upload error: {e}")
            return jsonify({"error": "Failed to save file"}), 500
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Explicitly mark user as offline on logout"""
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    data = request.get_json(silent=True)
    email = data.get('email') if data else None
    
    if not email:
        return jsonify({"error": "Missing email"}), 400
        
    try:
        # Set last_seen to a far past date to force offline status
        offline_time = "2000-01-01T00:00:00"
        users_collection.update_one(
            {"email": email},
            {"$set": {"last_seen": offline_time}}
        )
        return jsonify({"status": "logged_out"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def check_online_status(last_seen_str):
    """Calculate if a user is online based on 5-minute threshold"""
    if not last_seen_str:
        return False
    try:
        import datetime
        
        # Handle if last_seen is already a datetime object (BSON date)
        if isinstance(last_seen_str, datetime.datetime):
            last_seen = last_seen_str
        else:
            # Clean up string if needed
            clean_str = str(last_seen_str).replace('Z', '+00:00')
            if '.' in clean_str:
                parts = clean_str.split('.')
                if '+' in parts[1]:
                    clean_str = parts[0] + '+' + parts[1].split('+')[1]
                else:
                    clean_str = parts[0]
            last_seen = datetime.datetime.fromisoformat(clean_str)
        
        # Ensure last_seen is naive for calculation
        if last_seen.tzinfo is not None:
            now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)
            last_seen = last_seen.replace(tzinfo=None)
        else:
            now = datetime.datetime.utcnow()
            
        return (now - last_seen).total_seconds() < 300
    except Exception as e:
        print(f"DEBUG: Online status check failed for '{last_seen_str}': {e}")
        return False

# --- Admin APIs ---

@app.route('/api/admin/users', methods=['GET'])
@require_admin
def get_all_users():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    # Refresh dashboard by cleaning up old unverified entries
    # cleanup_expired_unverified_users()  # DISABLED: Function not defined
    
    users = []
    try:
        # Fetch all users, excluding passwords
        cursor = users_collection.find({}, {"password": 0})
        for user in cursor:
            try:
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
            except Exception as inner_e:
                print(f"Error processing user {user.get('email', 'unknown')}: {inner_e}")
                continue # Skip malformed users instead of crashing retrieval
                
        return jsonify(users), 200
    except Exception as e:
        print(f"DATABASE ERROR in get_all_users: {e}")
        return jsonify({"error": f"Database error retrieving users: {str(e)}"}), 500

@app.route('/api/admin/users/<user_id>', methods=['GET'])
@require_admin
def get_user_detail(user_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        # Try finding by string ID first
        user = users_collection.find_one({"_id": user_id})
        
        if not user:
            # Fallback 1: Try as numeric ID if it looks like one
            if user_id.isdigit():
                user = users_collection.find_one({"_id": int(user_id)})
            
        if not user:
            # Fallback 2: Try as ObjectId if it looks like one
            from bson import ObjectId
            if ObjectId.is_valid(user_id):
                user = users_collection.find_one({"_id": ObjectId(user_id)})
                
        if not user:
            return jsonify({"error": "User not found"}), 404
            
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
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
@require_admin
def delete_user(user_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        from bson import ObjectId
        user_id = user_id.strip()
        print(f"\n=== DELETE REQUEST ===")
        print(f"Received user_id: '{user_id}' (type: {type(user_id).__name__})")
        
        # First, try to find the user to see what ID format they have
        user = users_collection.find_one({"_id": user_id})
        if not user and user_id.isdigit():
            user = users_collection.find_one({"_id": int(user_id)})
        if not user and ObjectId.is_valid(user_id):
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            
        if user:
            actual_id = user.get('_id')
            print(f"Found user: {user.get('email')} with actual ID: '{actual_id}' (type: {type(actual_id).__name__})")
        else:
            print(f"User not found with any ID format")
            return jsonify({"error": "User not found"}), 404
        
        # Now delete using the actual ID from the found user
        result = users_collection.delete_one({"_id": actual_id})
        
        if result.deleted_count == 0:
            print(f"DELETE FAILED: No documents deleted")
            return jsonify({"error": "User not found or already deleted"}), 404
        
        print(f"DELETE SUCCESS: Removed user {user.get('email')} from database")
        return jsonify({"message": "User data permanently deleted from database"}), 200
    except Exception as e:
        print(f"DELETE ERROR: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users/<user_id>/status', methods=['PATCH'])
@require_admin
def admin_toggle_user_status_id(user_id):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    try:
        data = request.json
        new_status = data.get('is_active', True)
        user_id = user_id.strip()
        from bson import ObjectId
        
        # Sync is_disabled with is_active
        is_disabled = not new_status
        
        query = {"_id": user_id}
        result = users_collection.update_one(query, {"$set": {"is_active": new_status, "is_disabled": is_disabled}})
        
        if result.matched_count == 0 and user_id.isdigit():
            query = {"_id": int(user_id)}
            result = users_collection.update_one(query, {"$set": {"is_active": new_status, "is_disabled": is_disabled}})
            
        if result.matched_count == 0 and ObjectId.is_valid(user_id):
            query = {"_id": ObjectId(user_id)}
            result = users_collection.update_one(query, {"$set": {"is_active": new_status, "is_disabled": is_disabled}})
            
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({"message": f"User status updated to {'active' if new_status else 'inactive'}"}), 200
    except Exception as e:
        print(f"STATUS UPDATE ERROR: {e}")
        return jsonify({"error": str(e)}), 500

# --- User Search and Profile APIs ---

@app.route('/api/users/search', methods=['GET'])
def search_verified_users():
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    query = request.args.get('q', '').strip()
    current_email = request.args.get('current_email', '').strip() # Add support for current_email
    if not query:
        return jsonify([]), 200
        
    try:
        # Search for verified users (is_verified=True)
        # Split query into terms to allow "Henry jacob" to match name="Henry", email="...jacob..."
        terms = query.split()
        
        # Build an $and array where each term must match at least one field
        term_conditions = []
        for term in terms:
            term_regex = {"$regex": term, "$options": "i"}
            term_conditions.append({
                "$or": [
                    {"name": term_regex},
                    {"username": term_regex},
                    {"email": term_regex} # Include email in search
                ]
            })
            
        search_filter = {
            "is_verified": True,
            "$and": term_conditions
        }
        
        if current_email:
            # We already have an $and, so we can just append to it or merge
            # But wait, search_filter is top level.
            # Let's restructure efficiently:
            pass # See below for clean structure construction
            
        # Re-construct cleaner filter
        final_filter = {
            "is_verified": True,
            "$and": term_conditions
        }
        
        if current_email:
            final_filter["email"] = {"$ne": current_email}
            
        users = list(db.users.find(final_filter).limit(10))
        result = []
        for u in users:
            # Default username to first name if missing
            username = u.get("username")
            if not username and u.get("name"):
                username = u.get("name").split()[0].lower()
                
            result.append({
                "name": u.get("name"),
                "username": username,
                "profile_picture": u.get("profile_picture"),
                "is_online": check_online_status(u.get("last_seen"))
            })
            
        return jsonify(result), 200
    except Exception as e:
        print(f"SEARCH ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/profile/<username>', methods=['GET'])
def get_user_profile(username):
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    try:
        # Strategy 1: Exact username match
        user_data = db.users.find_one({"username": username})
        
        # Strategy 2: Case-insensitive username match
        if not user_data:
             user_data = db.users.find_one({"username": {"$regex": f"^{username}$", "$options": "i"}})
             
        # Strategy 3: Fallback - Match against First Name (if search used synthetic username)
        if not user_data:
            # If username is "harry", finding "Harry Potter"
            # We check if name starts with username (case-insensitive)
            # This aligns with the search logic: username = name.split()[0].lower()
            user_data = db.users.find_one({"name": {"$regex": f"^{username}", "$options": "i"}})

        if not user_data:
            return jsonify({"error": "User not found"}), 404
            
        profile = {
            "name": user_data.get("name"),
            "username": user_data.get("username"),
            "email": user_data.get("email"),
            "id": str(user_data.get("_id")),
            "profile_picture": user_data.get("profile_picture"),
            "is_online": check_online_status(user_data.get("last_seen")),
            "role": user_data.get("role", "student"),
            "overall_progress": user_data.get("overall_progress", 0),
            "modules_completed": user_data.get("modules_completed", []),
            "bio": user_data.get("bio", "Python Developer in training!"),
            "joined_at": user_data.get("joined_at") or user_data.get("created_at") or "2024-01-01"
        }
        
        return jsonify(profile), 200
    except Exception as e:
        print(f"PROFILE ERROR: {e}")
        return jsonify({"error": str(e)}), 500

# --- Automatic Local Save API ---

@app.route('/api/code/save-local', methods=['POST'])
def save_code_local():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    title = (data.get('title') or 'project').strip()
    code = data.get('code', '')
    folder = data.get('folder', 'Python Heroes/Projects')
    
    try:
        import os
        import re
        
        # Determine the target directory on the local machine
        # We'll save it relative to the backend's current directory or a known project root
        project_root = os.getcwd() # Typically where app.py is run from
        target_dir = os.path.join(project_root, folder)
        
        # Create directories if they don't exist
        os.makedirs(target_dir, exist_ok=True)
        
        # Sanitize filename
        safe_title = re.sub(r'[^a-zA-Z0-9]', '_', title)
        filename = f"{safe_title}.py"
        filepath = os.path.join(target_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)
            
        print(f"DEBUG: Automatically saved local file to {filepath}")
            
        return jsonify({
            "message": "Project saved successfully to local disk",
            "path": filepath,
            "filename": filename
        }), 200
    except Exception as e:
        print(f"LOCAL SAVE ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/migrate-ids', methods=['POST'])
@require_admin
def migrate_user_ids():
    """Migrate all existing non-formatted IDs to sequential IDs"""
    try:
        count = 0
        cursor = users_collection.find({})
        for user in cursor:
            current_id = str(user['_id'])
            # Check if ID is already in new format (10-digit number)
            # or already a chat_id (which we assume is also handled)
            if len(current_id) != 10 or not current_id.isdigit():
                new_id = get_next_sequence("user_id")
                print(f"MIGRATION: Moving {user['email']} from {current_id} to {new_id}")
                
                # Re-insert with new ID
                new_user = user.copy()
                users_collection.delete_one({"_id": user['_id']})
                new_user['_id'] = new_id
                users_collection.insert_one(new_user)
                count += 1
                
        return jsonify({"message": f"Successfully migrated {count} users to new ID format"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Learning Materials APIs ---

@app.route('/api/learning/materials', methods=['GET'])
def get_learning_materials():
    """Get all published learning materials"""
    if not ensure_connection():
        return jsonify([]), 200
    try:
        materials = list(db.learning_materials.find({"is_published": True}).sort("created_at", -1))
        for m in materials:
            m['_id'] = str(m['_id'])
        return jsonify(materials), 200
    except Exception as e:
        print(f"GET MATERIALS ERROR: {e}")
        return jsonify([]), 200

@app.route('/api/learning/materials', methods=['POST'])
@require_admin
def create_learning_material():
    """Create a new learning material (admin only)"""
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    data = request.json
    if not data or not data.get('title') or not data.get('url'):
        return jsonify({"error": "Title and URL are required"}), 400
    
    try:
        import datetime
        material = {
            "title": data.get('title', '').strip(),
            "description": data.get('description', '').strip(),
            "type": data.get('type', 'link'),
            "url": data.get('url', '').strip(),
            "category": data.get('category', 'General').strip(),
            "created_by": data.get('created_by', ''),
            "created_at": datetime.datetime.utcnow().isoformat(),
            "is_published": True
        }
        
        result = db.learning_materials.insert_one(material)
        material['_id'] = str(result.inserted_id)
        
        return jsonify({"message": "Material created", "material": material}), 201
    except Exception as e:
        print(f"CREATE MATERIAL ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/learning/materials/<material_id>', methods=['PUT'])
@require_admin
def update_learning_material(material_id):
    """Update a learning material (admin only)"""
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
        
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    try:
        from bson import ObjectId
        
        update_fields = {}
        if 'title' in data:
            update_fields['title'] = data['title'].strip()
        if 'description' in data:
            update_fields['description'] = data['description'].strip()
        if 'type' in data:
            update_fields['type'] = data['type']
        if 'url' in data:
            update_fields['url'] = data['url'].strip()
        if 'category' in data:
            update_fields['category'] = data['category'].strip()
        if 'is_published' in data:
            update_fields['is_published'] = data['is_published']
            
        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400
            
        result = db.learning_materials.update_one(
            {"_id": ObjectId(material_id)},
            {"$set": update_fields}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Material not found"}), 404
            
        return jsonify({"message": "Material updated"}), 200
    except Exception as e:
        print(f"UPDATE MATERIAL ERROR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/learning/materials/<material_id>', methods=['DELETE'])
@require_admin
def delete_learning_material(material_id):
    """Delete a learning material (admin only)"""
    if not ensure_connection():
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        from bson import ObjectId
        
        result = db.learning_materials.delete_one({"_id": ObjectId(material_id)})
        
        if result.deleted_count == 0:
            return jsonify({"error": "Material not found"}), 404
            
        return jsonify({"message": "Material deleted"}), 200
    except Exception as e:
        print(f"DELETE MATERIAL ERROR: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
