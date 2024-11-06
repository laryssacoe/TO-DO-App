"""
This module defines the routes for tasks in the Flask application.
"""

from flask import Blueprint, request, jsonify, session
from .database import db, Task, List

task_bp = Blueprint('task_routes', __name__)

# Define the route to get all tasks
@task_bp.route('/tasks', methods=['GET'])
def get_tasks():

    # Check if the user is logged in and has access to the session
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

    # Construct a JSON response with the lists and tasks
    lists_with_tasks = [{
        "id": list_item.id,
        "name": list_item.name,
        "tasks": get_task_hierarchy(list_item.tasks) if list_item.tasks else []  # Always ensure 'tasks' is a list
    } for list_item in user_lists]

    # Debugging: Print the lists with tasks
    print('List', lists_with_tasks)

    return jsonify({'lists': lists_with_tasks}), 200

# Construct a task hierarchy from a list of tasks
def get_task_hierarchy(tasks):
    def task_to_dict(task):
        return {
            "id": task.id,
            "text": task.text,
            "completed": task.completed,
            "level": task.level,
            "subtasks": [task_to_dict(subtask) for subtask in tasks if subtask.parent_id == task.id] or []  # Ensure subtasks is always an array
        }
    return [task_to_dict(task) for task in tasks if task.parent_id is None]

# Define the route to add a new task
@task_bp.route('/add_task', methods=['POST'])
def add_task():

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Get the task data from the request and validate the text field
    data = request.json
    if not data or 'text' not in data or not data['text'].strip():
        return jsonify({'error': 'Task text is required'}), 400

    # Check if the task has a parent task or belongs to a list
    if 'parent_id' in data and data['parent_id']:
        parent_task = Task.query.get(data['parent_id'])
        if not parent_task or parent_task.list.user_id != user_id:
            return jsonify({'error': 'Parent task not found or unauthorized'}), 404
        if parent_task.level >= 5:
            return jsonify({'error': 'Cannot add more than 5 levels of subtasks'}), 400

        # If everything is valid, create a new task with the parent's list ID and proper level
        new_task = Task(text=data['text'].strip(), completed=False, list_id=parent_task.list_id, parent_id=parent_task.id, level=parent_task.level + 1)
    
    else:

        # If no parent task is provided, check if the task belongs to a list
        if 'list_id' not in data or not isinstance(data['list_id'], int):
            return jsonify({'error': 'List ID is required and must be an integer'}), 400

        # Check if the list exists and belongs to the user
        list_obj = List.query.get(data['list_id'])
        if not list_obj or list_obj.user_id != user_id:
            return jsonify({'error': 'List not found or unauthorized'}), 404

        # If everything is valid, create a new task with level 1
        new_task = Task(text=data['text'].strip(), completed=False, list_id=list_obj.id, level=1)

    db.session.add(new_task)
    db.session.commit()

    # Return a JSON response with the new task
    return jsonify({
        "message": "Task added successfully",
        "task": {
            "id": new_task.id,
            "text": new_task.text,
            "completed": new_task.completed,
            "level": new_task.level,
            "subtasks": []  # Ensure subtasks is always an array
        }
    }), 201

# Define the route to update a task
@task_bp.route('/update_task/<int:task_id>', methods=['PUT'])
def update_task(task_id):

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Get the task data from the request and check if the task exists and belongs to the user
    data = request.json
    task = Task.query.get(task_id)
    if not task or task.list.user_id != user_id:
        return jsonify({'error': 'Task not found or unauthorized'}), 404

    # Update the task fields if they are provided in the request
    if 'text' in data:
        task.text = data['text'].strip()
    if 'completed' in data:
        task.completed = data['completed']

    if 'list_id' in data:
        task.list_id = data['list_id']

    # Commit the changes to the database and return a success message
    db.session.commit()
    return jsonify({'message': 'Task updated successfully'}), 200

# Define the route to delete a task
@task_bp.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Check if the task exists and belongs to the user
    task = Task.query.get(task_id)
    if not task or task.list.user_id != user_id:
        return jsonify({'error': 'Task not found or unauthorized'}), 404

    # Delete the task and commit the changes to the database
    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted successfully'}), 200

# Define the route to move a task to a different list
@task_bp.route('/move_task/<int:task_id>', methods=['PUT'])   
def move_task(task_id):
    try:

        data = request.get_json()
        new_list_id = data.get('list_id')

        if not new_list_id:
            return jsonify({"error": "Invalid list ID"}), 400

        # Fetch the task from the database
        task = Task.query.get(task_id)
        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Update the list_id field of the task and the list ID for all subtasks
        task.list_id = new_list_id

        def update_subtasks(task):
            for subtask in task.subtasks:
                subtask.list_id = new_list_id
                update_subtasks(subtask)

        update_subtasks(task)

        db.session.commit()

        # Debugging: Print the task ID and list ID before and after the update
        updated_task = Task.query.get(task_id)
        print(f"After update: Task ID {updated_task.id}, List ID {updated_task.list_id}")

        return jsonify({"message": "Task moved successfully", "task": {
            "id": task.id,
            "list_id": task.list_id,
            "text": task.text
        }}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500