import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';
import React, { useState } from 'react';

function Sidebar({ lists, onAddList, newListName, onNewListNameChange, setLists }) {
  const [editingListId, setEditingListId] = useState(null); // Tracks the ID of the list being edited
  const [editListName, setEditListName] = useState(''); // State for new list name when editing

  const handleDeleteList = async (listId) => {
    try {
      const response = await fetch(`http://localhost:4000/delete_list/${listId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setLists((prevLists) => prevLists.filter((list) => list.id !== listId));
      } else {
        console.error('Error deleting list:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleEditList = (listId, currentName) => {
    setEditingListId(listId); // Set the current list ID to edit
    setEditListName(currentName); // Set the current name for the edit input
  };

  const handleSaveEdit = async () => {
    if (!editListName || editListName.trim() === '') {
      console.error('Error: List name cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/update_list/${editingListId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: editListName }),
      });

      if (response.ok) {
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === editingListId ? { ...list, name: editListName } : list
          )
        );
        setEditingListId(null); // Reset editing state
        setEditListName(''); // Clear edit input state
      } else {
        const errorData = await response.json();
        console.error('Failed to update list:', errorData);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };


  const handleDeleteAllLists = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all lists? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:4000/delete_all_lists`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setLists([]); // Clear all lists from the state
      } else {
        console.error('Error deleting all lists:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  

  return (
    <div className="sidebar">
      <h2>To-Do Lists</h2>
      <div className="add-list-section">
        <input
          type="text"
          placeholder="Add new to-do list..."
          value={newListName}
          onChange={onNewListNameChange}
          className="add-list-input"
        />
        <button onClick={onAddList} className="add-list-btn">
          Add List
        </button>
      </div>
      <div className="lists-container">
        {lists.map((list) => (
          <div key={list.id} className="list-item">
            {editingListId === list.id ? (
              <>
                <input
                  type="text"
                  value={editListName}
                  onChange={(e) => setEditListName(e.target.value)}
                  placeholder="Enter new list name"
                  className="edit-input"
                />
                <button onClick={handleSaveEdit} className="save-btn">
                  Save
                </button>
              </>
            ) : (
              <>
                <span>{list.name}</span>
                <div className="list-actions">
                  <FontAwesomeIcon
                    icon={faPencilAlt}
                    title="Edit List"
                    onClick={() => handleEditList(list.id, list.name)}
                    className="action-icon edit-icon"
                    style={{ color: '#b0a3d4', cursor: 'pointer', fontSize: '1.33em' }}
                  />
                  <FontAwesomeIcon
                    icon={faTrash}
                    title="Delete List"
                    onClick={() => handleDeleteList(list.id)}
                    className="action-icon delete-icon"
                    style={{ color: '#b0a3d4', cursor: 'pointer', fontSize: '1.33em' }}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <button onClick={handleDeleteAllLists} className="delete-all-btn">Delete All Lists</button>
    </div>
  );
}

export default Sidebar;
