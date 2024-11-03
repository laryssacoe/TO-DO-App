// TaskList.js
import React from 'react';
import './TaskList.css';

function TaskList({ project, handleNewSubtaskChange, newSubtaskText, handleAddSubtask, toggleSubtaskCompletion }) {
  return (
    <div className="project-section">
      <h2 className="project-title">{project.name}</h2>
      <div className="task-list container">
        {project.tasks.map(task => (
          <div key={task.id} className={task.completed ? 'completed task-item task-card' : 'task-item task-card'}>
            <div className="task-header">
              <input type="checkbox" checked={task.completed} readOnly />
              <span className="task-text">{task.text}</span>
            </div>
            {/* Add New Subtask Section */}
            <div className="add-subtask-container">
              <input
                type="text"
                placeholder="Add new subtask..."
                value={newSubtaskText[task.id] || ''}
                onChange={(e) => handleNewSubtaskChange(task.id, e.target.value)}
                className="new-subtask-input"
              />
              <button onClick={() => handleAddSubtask(task.id)} className="add-subtask-btn">
                Add Subtask
              </button>
            </div>
            {/* Subtasks */}
            {task.subtasks && task.subtasks.length > 0 && (
              <ul className="subtask-list">
                {task.subtasks.map(subtask => (
                  <li key={subtask.id} className={subtask.completed ? 'completed subtask-item' : 'subtask-item'}>
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtaskCompletion(subtask.id)}
                    />
                    {subtask.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TaskList;
