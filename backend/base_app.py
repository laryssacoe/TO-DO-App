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
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,
)
app.permanent_session_lifetime = timedelta(minutes=5)

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

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        session['user_id'] = user.id
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200


# Fetches all tasks from the database and returns them as a JSON response
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        lists = List.query.all()
        if not lists:
            print("No lists found")
        else:
            print(f"Found {len(lists)} lists")

        lists_with_tasks = [{
            "id": list_item.id,
            "name": list_item.name,
            "tasks": get_task_hierarchy(list_item.tasks)
        } for list_item in lists]

        return jsonify({'lists': lists_with_tasks}), 200

    except Exception as e:
        print(f"Error occurred: {e}")  # Log the error for debugging
        return jsonify({"error": f"An error occurred while fetching lists and tasks: {str(e)}"}), 500

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

# Adds a new list to the database
@app.route('/add_list', methods=['POST'])
def add_list():
    try:
        data = request.json
        if not data or 'name' not in data or not data['name'].strip():
            return jsonify({'error': 'List name is required'}), 400

        new_list = List(name=data['name'].strip(), user_id=1)  # Assuming user_id = 1 for testing
        db.session.add(new_list)
        db.session.commit()

        return jsonify({
            "message": "List added successfully",
            "list": {
                "id": new_list.id,
                "name": new_list.name
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

# Adds a new task or subtask to the database
@app.route('/add_task', methods=['POST'])
def add_task():
    try:
        data = request.json
        if not data or 'text' not in data or not data['text'].strip():
            return jsonify({'error': 'Task text is required'}), 400

        if 'list_id' not in data and 'parent_id' not in data:
            return jsonify({'error': 'Either list_id or parent_id is required'}), 400

        if 'parent_id' in data and data['parent_id']:
            parent_task = Task.query.get(data['parent_id'])
            if not parent_task:
                return jsonify({'error': 'Parent task not found'}), 404
            if parent_task.level >= 5:
                return jsonify({'error': 'Cannot add more than 5 levels of subtasks'}), 400

            new_task = Task(text=data['text'].strip(), completed=False, list_id=parent_task.list_id, parent_id=parent_task.id, level=parent_task.level + 1)
        else:
            if 'list_id' not in data or not isinstance(data['list_id'], int):
                return jsonify({'error': 'List ID is required and must be an integer'}), 400

            new_task = Task(text=data['text'].strip(), completed=False, list_id=data['list_id'], level=1)

        print(f"Adding task: {new_task.text}")
        print(f"Parent ID: {new_task.parent_id}")
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

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

# Toggle the completion status of a list
@app.route('/toggle_list/<int:list_id>', methods=['POST'])
def toggle_list(list_id):
    try:
        list_obj = List.query.get(list_id)
        if not list_obj:
            return jsonify({"error": "List not found"}), 404

        # Check the completion status to determine if we should mark all as completed or not
        new_status = not all(task.completed for task in list_obj.tasks)
        for task in list_obj.tasks:
            toggle_task_completion(task, new_status)

        db.session.commit()

        return jsonify({"message": "List and all its tasks/subtasks completion status updated"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

def toggle_task_completion(task, new_status):
    task.completed = new_status
    subtasks = Task.query.filter_by(parent_id=task.id).all()
    for subtask in subtasks:
        toggle_task_completion(subtask, new_status)


# Update the completion status of a task
@app.route('/update_task/<int:task_id>', methods=['POST'])
def update_task(task_id):
    try:
        data = request.json

        # Fetch the task using db.session.get for SQLAlchemy 2.0
        task = db.session.get(Task, task_id)
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        # Update the completed status
        task.completed = data.get('completed', task.completed)
        db.session.commit()

        # Return the updated task information
        return jsonify({'message': 'Task updated successfully', 'task': {
            'id': task.id,
            'text': task.text,
            'completed': task.completed
        }}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500


    
# Clears all tasks and subtasks from the database
@app.route('/clear_tasks', methods=['POST'])
def clear_tasks():
    try:
        Task.query.delete()
        db.session.commit()

        return jsonify({"message": "All tasks and subtasks have been deleted"}), 200
    except Exception as e:
        print(f"Error occurred while clearing tasks: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    with app.app_context():
        try:
            db.create_all()
            print("Tables created successfully.")
        except Exception as e:
            print(f"Error creating tables: {e}")

    app.run(port=4000, debug=True)