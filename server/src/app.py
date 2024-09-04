# server/app.py
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import json
import os


def create_app(config_path='config.json'):
    app = Flask(__name__, template_folder='./../client/html')
    with open(config_path) as config_file:
        config = json.load(config_file)
    
    # Apply configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY') or config['jwt_secret_key']
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') or config['secret_key']
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL') or config['database_uri']

     # Initialize JWTManager with the Flask app
    jwt = JWTManager(app)
    # Enable CORS with specific settings
    CORS(app, resources={r"/*": {"origins": "*"}})

    # # Initialize Flask-Admin
    # admin = Admin(app, name='MyApp', template_mode='bootstrap3')
    # admin.add_view(ModelView(User, db.session))

    # Register blueprints
    from src.auth import auth_bp
    from src.website import website_bp
    from src.backend import backend_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(website_bp)
    app.register_blueprint(backend_bp)

    return app
