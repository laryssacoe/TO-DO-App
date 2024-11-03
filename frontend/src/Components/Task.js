import React, { useState } from 'react';

const Task = ({ task, onToggleTask, onAddSubtask }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Defensive check: If task is undefined or missing required properties, return null
  if (!task || typeof task.completed === 'undefined') {
    return null;
  }

  // Toggle task completion
  const handleToggleTask = () => {
    onToggleTask(task.id);
  };

  // Add new subtask
  const handleAddSubtask = () => {
    if (newSubtaskText.trim() !== '') {
      onAddSubtask(task.id, newSubtaskText);
      setNewSubtaskText('');
    }
  };

  return (
    <div className="task-item">
      <div>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleTask}
        />
        <span className={task.completed ? 'completed' : ''}>
          {task.text}
        </span>
        <button
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '[-]' : '[+]'}
        </button>
      </div>
      {isExpanded && (
        <div className="subtasks-container">
          {task.subtasks &&
            task.subtasks.length > 0 &&
            task.subtasks.map((subtask) => (
              <Task
                key={subtask.id}
                task={subtask}
                onToggleTask={onToggleTask}
                onAddSubtask={onAddSubtask}
              />
            ))}
          <div className="add-subtask">
            <input
              type="text"
              placeholder="Add new subtask..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
            />
            <button onClick={handleAddSubtask}>
              Add subtask to {task.text}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;