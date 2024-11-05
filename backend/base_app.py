"""
This is the main Flask application file that defines the API endpoints for the task manager.
It interacts with the database models defined in database.py to perform CRUD operations for lists and tasks.
"""

# Imports the necessary packages
import os
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import timedelta
from database import db, Task, User, List

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
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
)
app.permanent_session_lifetime = timedelta(days=10)

# Enable CORS
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)


# Log requests for debugging
@app.before_request
def log_request_info():
    print("\n=== Incoming Request ===")
    print("Method:", request.method)
    print("URL:", request.url)
    print("Headers:", request.headers)
    print("Body:", request.get_data())

# User Authentication Routes
@app.route('/', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        session.permanent = True  # Set the session as permanent
        session['user_id'] = user.id  # Set the user ID in the session
        
        # Debugging: Check if the session contains the user ID
        print("User logged in:", user.username)
        print("Session user_id set:", session.get('user_id'))  # Log to verify session state
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if User.query.filter_by(username=data['username']).first() or User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Username or email already exists'}), 400

    new_user = User(username=data['username'], email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User created successfully'}), 201

@app.route('/check_session', methods=['GET', 'POST'])
def check_session():
    user_id = session.get('user_id')

    if request.method == 'GET':
        if user_id:
            return jsonify({'message': 'Session active', 'user_id': user_id}), 200
        else:
            return jsonify({'error': 'No session found'}), 401

    elif request.method == 'POST':
        session.pop('user_id', None)
        return jsonify({'message': 'Logout successful'}), 200


# Task Management Routes
@app.route('/tasks', methods=['GET'])
def get_tasks():
    # Debugging session data
    print("Session data at /tasks:", session)  # Log the entire session state
    user_id = session.get('user_id')
    if not user_id:
        print("Unauthorized access attempt. No user_id in session.")
        return jsonify({'error': 'Unauthorized'}), 401

    # Fetch the lists for the logged-in user
    user_lists = List.query.filter_by(user_id=user_id).all()

    if not user_lists:
        print("No lists found for user")
    else:
        print(f"Found {len(user_lists)} lists for user {user_id}")

    # Format the response
    lists_with_tasks = [{
        "id": list_item.id,
        "name": list_item.name,
        "tasks": get_task_hierarchy(list_item.tasks)
    } for list_item in user_lists]

    return jsonify({'lists': lists_with_tasks}), 200

def get_task_hierarchy(tasks):
    def task_to_dict(task):
        return {
            "id": task.id,
            "text": task.text,
            "completed": task.completed,
            "level": task.level,
            "subtasks": [task_to_dict(subtask) for subtask in tasks if subtask.parent_id == task.id]
        }
    return [task_to_dict(task) for task in tasks if task.parent_id is None]

@app.route('/add_list', methods=['POST'])
def add_list():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    if not data or 'name' not in data or not data['name'].strip():
        return jsonify({'error': 'List name is required'}), 400

    new_list = List(name=data['name'].strip(), user_id=user_id)
    db.session.add(new_list)
    db.session.commit()

    return jsonify({
        "message": "List added successfully",
        "list": {
            "id": new_list.id,
            "name": new_list.name
        }
    }), 201

@app.route('/add_task', methods=['POST'])
def add_task():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    if not data or 'text' not in data or not data['text'].strip():
        return jsonify({'error': 'Task text is required'}), 400

    if 'parent_id' in data and data['parent_id']:
        parent_task = Task.query.get(data['parent_id'])
        if not parent_task or parent_task.list.user_id != user_id:
            return jsonify({'error': 'Parent task not found or unauthorized'}), 404
        if parent_task.level >= 5:
            return jsonify({'error': 'Cannot add more than 5 levels of subtasks'}), 400

        new_task = Task(text=data['text'].strip(), completed=False, list_id=parent_task.list_id, parent_id=parent_task.id, level=parent_task.level + 1)
    else:
        if 'list_id' not in data or not isinstance(data['list_id'], int):
            return jsonify({'error': 'List ID is required and must be an integer'}), 400

        list_obj = List.query.get(data['list_id'])
        if not list_obj or list_obj.user_id != user_id:
            return jsonify({'error': 'List not found or unauthorized'}), 404

        new_task = Task(text=data['text'].strip(), completed=False, list_id=list_obj.id, level=1)

    db.session.add(new_task)
    db.session.commit()

    return jsonify({
        "message": "Task added successfully",
        "task": {
            "id": new_task.id,
            "text": new_task.text,
            "completed": new_task.completed,
            "level": new_task.level,
            "subtasks": []
        }
    }), 201

@app.route('/clear_db', methods=['POST'])
def clear_db():
    try:
        # Delete all rows from all tables
        db.session.query(Task).delete()
        db.session.query(List).delete()
        db.session.query(User).delete()
        db.session.commit()

        return jsonify({'message': 'Database content cleared successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error clearing database content: {str(e)}'}), 500

# Edit a task or subtask
@app.route('/update_task/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    task = Task.query.get(task_id)
    if not task or task.list.user_id != user_id:
        return jsonify({'error': 'Task not found or unauthorized'}), 404

    if 'text' in data:
        task.text = data['text'].strip()
    if 'completed' in data:
        task.completed = data['completed']

    db.session.commit()

    return jsonify({'message': 'Task updated successfully'}), 200

# Delete a task or subtask
@app.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    task = Task.query.get(task_id)
    if not task or task.list.user_id != user_id:
        return jsonify({'error': 'Task not found or unauthorized'}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted successfully'}), 200

# Edit a list
@app.route('/update_list/<int:list_id>', methods=['PUT'])
def update_list(list_id):
    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        data = request.get_json()
        new_name = data.get("name")

        if not new_name:
            return jsonify({"error": "Missing 'name' in request"}), 400

        # Fetch the list from the database using SQLAlchemy
        list_item = List.query.get(list_id)

        if not list_item:
            return jsonify({"error": "List not found"}), 404

        # Update the list's name
        list_item.name = new_name
        db.session.commit()

        return jsonify({"message": "List updated successfully", "list": {"id": list_item.id, "name": list_item.name}}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables are created
    app.run(port=4000)



# Delete List Route
@app.route('/delete_list/<int:list_id>', methods=['DELETE'])
def delete_list(list_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    list_to_delete = List.query.get(list_id)
    if not list_to_delete or list_to_delete.user_id != user_id:
        return jsonify({'error': 'List not found or unauthorized'}), 404

    db.session.delete(list_to_delete)
    db.session.commit()

    return jsonify({'message': 'List deleted successfully'}), 200


@app.after_request
def add_cors_headers(response):
    print("\n=== Outgoing Response ===")
    print(response.headers)
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response


# Run the Flask app
if __name__ == "__main__":

    print(app.url_map)
    with app.app_context():
        try:
            db.create_all()
            print("Tables created successfully.")
        except Exception as e:
            print(f"Error creating tables: {e}")

    app.run(port=4000, debug=True)
