import React from 'react';
import './Sidebar.css';

function Sidebar({ className, lists, onAddList, newListName, onNewListNameChange }) {
  return (
    <div className={className}>
      <h2>Lists</h2>
      <div className="add-list-section">
        <input 
          type="text"
          placeholder="Add new list..."
          value={newListName}
          onChange={onNewListNameChange}
          className="add-list-input"
        />
        <button onClick={onAddList} className="add-list-btn">
          Add List
        </button>
      </div>
      <ul className="lists">
        {lists.map((list) => (
          <li key={list.id} className="list-item">
            {list.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
