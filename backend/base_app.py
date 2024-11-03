"""
This is the main Flask application file that defines the API endpoints for the task manager.
It interacts with the database models defined in database.py to perform CRUD operations for lists and tasks.
"""

# Imports the necessary packages
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import timedelta
from database import db, Task, Subtask, User, List

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


# Fetches all tasks from the database and returns them as a JSON response
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        lists = List.query.all()
        lists_with_tasks = [{
            "id": list_item.id,
            "name": list_item.name,
            "tasks": [
                {
                    "id": task.id,
                    "text": task.text,
                    "completed": task.completed,
                    "subtasks": [
                        {
                            "id": subtask.id,
                            "text": subtask.text,
                            "completed": subtask.completed
                        }
                        for subtask in task.subtasks
                    ]
                }
                for task in list_item.tasks
            ]
        } for list_item in lists]

        return jsonify({'lists': lists_with_tasks}), 200

    except Exception as e:
        return jsonify({"error": f"An error occurred while fetching lists and tasks: {str(e)}"}), 500


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

# Adds a new task to the database and associates it with a specific list
@app.route('/add_task', methods=['POST'])
def add_task():
    try:
        data = request.json
        if not data or 'text' not in data or not data['text'].strip():
            return jsonify({'error': 'Task text is required'}), 400

        if 'list_id' not in data or not isinstance(data['list_id'], int):
            return jsonify({'error': 'List ID is required and must be an integer'}), 400

        new_task = Task(text=data['text'].strip(), completed=False, list_id=data['list_id'])
        db.session.add(new_task)
        db.session.commit()

        return jsonify({
            "message": "Task added successfully",
            "task": {
                "id": new_task.id,
                "text": new_task.text,
                "completed": new_task.completed,
                "subtasks": []
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500


# Adds a new subtask to the database
@app.route('/add_subtask', methods=['POST'])
def add_subtask():
    try:
        data = request.json
        if not data or 'text' not in data or not data['text'].strip() or 'task_id' not in data:
            return jsonify({'error': 'Subtask text and task_id are required'}), 400

        task_id = data['task_id']
        text = data['text'].strip()

        new_subtask = Subtask(text=text, task_id=task_id)
        db.session.add(new_subtask)
        db.session.commit()

        return jsonify({
            "message": "Subtask added successfully",
            "subtask": {
                "id": new_subtask.id,
                "text": new_subtask.text,
                "completed": new_subtask.completed
            }
        }), 201

    except Exception as e:
        print(f"Error occurred while adding subtask: {e}")
        db.session.rollback()
        return jsonify({"error": "An internal error occurred"}), 500

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
            task.completed = new_status
            for subtask in task.subtasks:
                subtask.completed = new_status

        db.session.commit()

        return jsonify({"message": "List and all its tasks/subtasks completion status updated"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Update the toggle_task and toggle_subtask routes to propagate status up or down
@app.route('/toggle_task/<int:task_id>', methods=['POST'])
def toggle_task(task_id):
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Toggle task completed status
        task.completed = not task.completed
        db.session.commit()

        return jsonify({
            "message": "Task completion status updated",
            "task": {
                "id": task.id,
                "text": task.text,
                "completed": task.completed,
                "subtasks": [
                    {"id": st.id, "text": st.text, "completed": st.completed}
                    for st in task.subtasks
                ]
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/toggle_subtask/<int:subtask_id>', methods=['POST'])
def toggle_subtask(subtask_id):
    try:
        subtask = Subtask.query.get(subtask_id)
        if not subtask:
            return jsonify({"error": "Subtask not found"}), 404

        # Toggle subtask completed status
        subtask.completed = not subtask.completed
        db.session.commit()

        # Check if all siblings are completed, then update parent task
        task = Task.query.get(subtask.task_id)
        if all(st.completed for st in task.subtasks):
            task.completed = True
        else:
            task.completed = False

        db.session.commit()

        return jsonify({
            "message": "Subtask completion status updated",
            "subtask": {
                "id": subtask.id,
                "text": subtask.text,
                "completed": subtask.completed
            },
            "task": {
                "id": task.id,
                "text": task.text,
                "completed": task.completed
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    
# Clears all tasks and subtasks from the database
@app.route('/clear_tasks', methods=['POST'])
def clear_tasks():
    try:
        Subtask.query.delete()
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