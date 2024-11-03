import React, { useState } from 'react';
import './TaskList.css';

function TaskList({ list, newTaskTexts, handleNewTaskChange, handleAddTask }) {
  const [isExpanded, setIsExpanded] = useState(true); // State to track expand/collapse

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded); // Toggles between true and false
  };

  return (
    <div className="list-container">
      {/* Title with Expand/Collapse Toggle */}
      <div className="list-header">
        <button
          className="toggle-button"
          onClick={() => handleToggleExpand()}
        >
          {isExpanded ? '-' : '+'}
        </button>
        <h3 className="list-title">{list.name}</h3>
      </div>

      {/* Render Tasks under each List */}
      {isExpanded && (
        <ul className="task-list">
          {Array.isArray(list.tasks) && list.tasks.length > 0 ? (
            list.tasks.map((task) => (
              <li
                key={task.id}
                className={`task-item ${task.completed ? 'completed-item' : ''}`}
              >
                <div className="task-details">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {
                      /* handle task completion here */
                    }}
                  />
                  <span className="task-text">{task.text}</span>
                </div>
                {/* Subtasks */}
                {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                  <ul className="subtask-list">
                    {task.subtasks.map((subtask) => (
                      <li
                        key={subtask.id}
                        className={`subtask-item ${subtask.completed ? 'completed-item' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() => {
                            /* handle subtask completion here */
                          }}
                        />
                        {subtask.text}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))
          ) : (
            <p>No tasks available for this list.</p>
          )}
        </ul>
      )}

      {/* Add New Task Section for Selected List */}
      <div className="add-task">
        <input
          type="text"
          placeholder="Add new task..."
          value={newTaskTexts[list.id] || ''}
          onChange={(e) => handleNewTaskChange(list.id, e.target.value)}
          className="new-task-input"
        />
        <button onClick={() => handleAddTask(list.id)} className="add-task-btn">
          Add sub-task to {list.name}
        </button>
      </div>
    </div>
  );
}

export default TaskList;
