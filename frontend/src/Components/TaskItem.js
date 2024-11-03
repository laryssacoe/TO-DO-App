import React, { useState } from 'react';
import SubtaskList from './SubtaskList';

const SubtaskRecursive = ({ subtask, addSubtask }) => {
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleInputChange = (e) => {
    setNewSubtaskText(e.target.value);
  };

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
      addSubtask(subtask.id, newSubtaskText);
      setNewSubtaskText('');
    }
  };

  return (
    <li className="subtask-item">
      <div className="subtask-details">
        <input
          type="checkbox"
          checked={subtask.completed}
          onChange={() => { /* handle subtask completion */ }}
        />
        <span>{subtask.text}</span>
      </div>
      
      {/* Input for adding a new nested subtask */}
      <div className="add-subtask">
        <input
          type="text"
          value={newSubtaskText}
          onChange={handleInputChange}
          placeholder="Add new subtask..."
          className="new-subtask-input"
        />
        <button onClick={handleAddSubtask} className="add-subtask-btn">Add Subtask</button>
      </div>

      {/* Render nested subtasks */}
      {subtask.subtasks && subtask.subtasks.length > 0 && (
        <SubtaskList subtasks={subtask.subtasks} addSubtask={addSubtask} />
      )}
    </li>
  );
};

export default SubtaskRecursive;
