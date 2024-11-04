import React, { useState } from 'react';
import './TaskList.css';

function Task({ task, level, onAddSubtask, setLists }) {
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddSubtask = () => {
    if (level < 5 && newSubtaskText.trim() !== '') {
      onAddSubtask(task.id, newSubtaskText);
      setNewSubtaskText(''); // Clear input after adding
    } else if (level >= 5) {
      alert("Maximum subtask depth reached (Level 5)");
    }
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCompletionToggle = async () => {
    const newCompletedStatus = !task.completed;

    // Update the task completion status in the backend
    try {
      const response = await fetch(`http://localhost:4000/update_task/${task.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: newCompletedStatus }),
      });

      if (response.ok) {
        // Update the lists state to reflect the changes immediately
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            tasks: updateTaskAndSubtasks(list.tasks, task.id, newCompletedStatus),
          }))
        );
      } else {
        console.error('Failed to update task', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Utility function to update the task and its subtasks recursively
  const updateTaskAndSubtasks = (tasks, taskId, completedStatus) => {
    return tasks.map((t) => {
      if (t.id === taskId) {
        // Update the task
        return { ...t, completed: completedStatus };
      } else if (t.subtasks && t.subtasks.length > 0) {
        // Recursively update subtasks
        return { ...t, subtasks: updateTaskAndSubtasks(t.subtasks, taskId, completedStatus) };
      }
      return t;
    });
  };

  return (
    <div
      className={`task-item ${task.completed ? 'completed-item' : ''}`}
      style={{
        marginBottom: '15px',
        marginLeft: `${level * 20}px`,
        padding: '10px',
        borderLeft: '2px solid #ccc',
        borderRadius: '5px',
      }}
    >
      <div className="task-details">
        <button onClick={handleToggleExpand} className="toggle-button">
          {isExpanded ? '-' : '+'}
        </button>
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={handleCompletionToggle}
        />
        <span className={`task-text ${task.completed ? 'crossed-off' : ''}`}>{task.text}</span>
      </div>

      {/* Render Subtasks */}
      {isExpanded && Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
        <div className="subtask-list">
          {task.subtasks.map((subtask) => (
            <Task
              key={subtask.id}
              task={subtask}
              level={level + 1}
              onAddSubtask={onAddSubtask}
              setLists={setLists}
            />
          ))}
        </div>
      )}

      {/* Add Subtask Section */}
      {level < 5 && (
        <div className="add-subtask">
          <input
            type="text"
            placeholder="Add new subtask..."
            value={newSubtaskText}
            onChange={(e) => setNewSubtaskText(e.target.value)}
            className="new-subtask-input"
            style={{ marginTop: '5px' }}
          />
          <button onClick={handleAddSubtask} className="add-subtask-btn">
            Add Subtask
          </button>
        </div>
      )}
    </div>
  );
}

export default Task;
