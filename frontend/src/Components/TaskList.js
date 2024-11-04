import React, { useState, useEffect } from 'react';
import Task from './TaskItem';
import './TaskList.css';

function TaskList({ list, newTaskTexts, handleNewTaskChange, handleAddTask, onAddSubtask, handleTaskCompletion, setLists }) {
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
        <div className="task-list">
          {Array.isArray(list.tasks) && list.tasks.length > 0 ? (
            list.tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                level={1}
                onAddSubtask={onAddSubtask}
                setLists={setLists} // Pass setLists here
              />
            ))
          ) : (
            <p>No tasks available for this list.</p>
          )}
        </div>
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
          Add Task to {list.name}
        </button>
      </div>
    </div>
  );
}

export default TaskList;