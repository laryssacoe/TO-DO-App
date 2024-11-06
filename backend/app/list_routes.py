"""
This module contains the routes for list operations.
"""

from flask import Blueprint, request, jsonify, session
from .database import db, Task, List, User

list_bp = Blueprint('list_routes', __name__)

# Define the route to get all lists
@list_bp.route('/add_list', methods=['POST'])
def add_list():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Get the list data from the request and validate the name field
    data = request.json
    if not data or 'name' not in data or not data['name'].strip():
        return jsonify({'error': 'List name is required'}), 400

    # Create a new list and add it to the database
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

# Define the route to update a list
@list_bp.route('/update_list/<int:list_id>', methods=['PUT'])
def update_list(list_id):

    try:
        if not request.is_json:
            return jsonify({"error": "Request must be JSON"}), 400

        # Get the new name from the request
        data = request.get_json()
        new_name = data.get("name")

        if not new_name:
            return jsonify({"error": "Missing 'name' in request"}), 400

        # Fetch the list from the database 
        list_item = List.query.get(list_id)

        if not list_item:
            return jsonify({"error": "List not found"}), 404

        # Update the list's name
        list_item.name = new_name
        db.session.commit()

        return jsonify({"message": "List updated successfully", "list": {"id": list_item.id, "name": list_item.name}}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Define the route to delete a list
@list_bp.route('/delete_list/<int:list_id>', methods=['DELETE'])
def delete_list(list_id):

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Check if the list exists and belongs to the user
    list_to_delete = List.query.get(list_id)
    if not list_to_delete or list_to_delete.user_id != user_id:
        return jsonify({'error': 'List not found or unauthorized'}), 404

    try:
        # Explicitly delete all tasks associated with the list
        Task.query.filter_by(list_id=list_to_delete.id).delete()

        # Delete the list and commit the changes to the database
        db.session.delete(list_to_delete)
        db.session.commit()
        return jsonify({'message': 'List and associated tasks deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()  # Rollback if there's an error
        return jsonify({'error': str(e)}), 500
    
# Define the route to delete all lists
@list_bp.route('/delete_all_lists', methods=['DELETE'])
def delete_all_lists():

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        # Delete all lists that belong to the current user
        List.query.filter_by(user_id=user_id).delete()
        db.session.commit()

        return jsonify({'message': 'All lists deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error deleting lists: {str(e)}'}), 500
    
# For the developer: Define a route to clear all database content
@list_bp.route('/clear_db', methods=['POST'])
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
