from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Import our modular parts - Reload Triggered

from .extensions import init_extensions
from .auth import auth_bp
from .chat import chat_bp
from .admin import admin_bp
from .code import code_bp
from .learning import learning_bp
from .profile import profile_bp
from .system import system_bp
from .ai_teacher import ai_teacher_bp

# Load environment variables
load_dotenv()

def create_app():
    basedir = os.path.abspath(os.path.dirname(__file__))
    
    app = Flask(__name__,
                static_folder=os.path.join(basedir, '../dist'),
                template_folder=os.path.join(basedir, '../dist'))
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret_key')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['UPLOAD_FOLDER'] = os.path.join(basedir, 'uploads')
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize CORS
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize Extensions
    init_extensions(app)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(chat_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(code_bp)
    app.register_blueprint(learning_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(system_bp)
    app.register_blueprint(ai_teacher_bp)

    from flask import send_from_directory
    
    # Catch-all route for SPA - must be registered AFTER all API blueprints
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        # If path starts with 'api/', let Flask return 404 (handled by blueprints)
        if path.startswith('api/'):
            return {'error': 'Not found'}, 404
            
        # If it's a static file (has extension and exists), serve it
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        
        # For all other routes (SPA routes), serve index.html
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
