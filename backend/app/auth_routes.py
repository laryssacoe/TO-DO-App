"""
This file contains the authentication routes for the application, including login, signup, and logout.
"""

from flask import Blueprint, request, jsonify, session
from .database import db, User

# Create a Blueprint for the authentication routes
auth_bp = Blueprint('auth_routes', __name__)

# Define the login route
@auth_bp.route('/', methods=['POST'])
def login():

    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    # Check user credentials and set the session user_id
    if user and user.check_password(data['password']):
        session.permanent = True 
        session['user_id'] = user.id  
        
        # Debugging: Check if the session contains the user ID
        print("User logged in:", user.username)
        print("Session user_id set:", session.get('user_id'))  
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

# Define the signup route
@auth_bp.route('/signup', methods=['POST'])
def signup():

    # Get the user data from the request and check if the username or email already exists (unique constraint)
    data = request.json
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    # Create a new user and add it to the database
    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

# Define the logout route
@auth_bp.route('/logout', methods=['POST'])
def logout():

    # Check if the user is logged in and remove the user_id from the session
    user_id = session.pop('user_id', None)  
    if user_id:
        return jsonify({'message': 'Logout successful'}), 200
    
    else:
        return jsonify({'error': 'No active session found'}), 401