import React from 'react';
import SubTaskItem from './SubTaskItem';
import './TaskItem.css';

function TaskItem({ task, expanded, listId }) {
  return (
    <li className={`task-item ${task.completed ? 'completed-item' : ''}`}>
      <div className="task-header">
        <span className="toggle-button">
          {/* Placeholder: Implement handleToggleExpand here */}
          {expanded ? '[-]' : '[+]'}
        </span>
        <input
          type="checkbox"
          checked={task.completed}
          // Placeholder: Implement handleToggleTask here
        />
        <span className="task-text">
          {task.text}
        </span>
      </div>

      {/* Subtasks */}
      {expanded && Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
        <ul className="subtask-list">
          {task.subtasks.map(subtask => (
            <SubTaskItem key={subtask.id} subtask={subtask} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default TaskItem;