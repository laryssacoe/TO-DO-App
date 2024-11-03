import React from 'react';
import './SubtaskItem.css';

function SubtaskItem({ subtask }) {
  return (
    <li className={`subtask-item ${subtask.completed ? 'completed-item' : ''}`}>
      <input
        type="checkbox"
        checked={subtask.completed}
        // Placeholder: Implement handleToggleSubtask here
      />
      {subtask.text}
    </li>
  );
}

export default SubtaskItem;