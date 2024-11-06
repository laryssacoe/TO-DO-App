"""
This file initializes the Flask application.
It registers the Blueprints for different routes, initializes the database, and sets up session configuration and CORS.
"""

import os
from flask import Flask
from flask_cors import CORS
from datetime import timedelta
from .database import db

def create_app():
    # Create the Flask application
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'L'

    # Create an absolute path for the database file
    db_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'tasks.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    db.init_app(app)

    # Session configuration
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config.update(
        SESSION_COOKIE_SAMESITE="Lax",  # Lax used for security and compatibility with credentials
        SESSION_COOKIE_SECURE=False,
    )
    app.permanent_session_lifetime = timedelta(days=10)

    # Enable CORS for port 3000 to allow requests from the frontend in this domain only
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

    with app.app_context():
        # Import the routes and register the Blueprints
        from .task_routes import task_bp
        from .list_routes import list_bp
        from .auth_routes import auth_bp

        app.register_blueprint(task_bp)
        app.register_blueprint(list_bp)
        app.register_blueprint(auth_bp)

        db.create_all()  

    return app
