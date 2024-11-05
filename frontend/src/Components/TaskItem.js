import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import './TaskList.css';

function Task({ task, level, setLists }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [taskText, setTaskText] = useState(task.text);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCompletionToggle = async () => {
    const newCompletedStatus = !task.completed;
    try {
      const response = await fetch(`http://localhost:4000/update_task/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ completed: newCompletedStatus }),
      });
      if (response.ok) {
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            tasks: updateTaskAndSubtasks(list.tasks, task.id, { completed: newCompletedStatus }),
          }))
        );
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditTask = async () => {
    try {
      const response = await fetch(`http://localhost:4000/update_task/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: taskText }),
      });
      if (response.ok) {
        setIsEditing(false);
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            tasks: updateTaskAndSubtasks(list.tasks, task.id, { text: taskText }),
          }))
        );
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      const response = await fetch(`http://localhost:4000/delete_task/${task.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            tasks: removeTaskAndSubtasks(list.tasks, task.id),
          }))
        );
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  const updateTaskAndSubtasks = (tasks, taskId, updatedFields) => {
    return tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, ...updatedFields };
      } else if (t.subtasks && t.subtasks.length > 0) {
        return { ...t, subtasks: updateTaskAndSubtasks(t.subtasks, taskId, updatedFields) };
      }
      return t;
    });
  };

  const removeTaskAndSubtasks = (tasks, taskId) => {
    return tasks.filter((t) => {
      if (t.id === taskId) return false;
      if (t.subtasks && t.subtasks.length > 0) {
        t.subtasks = removeTaskAndSubtasks(t.subtasks, taskId);
      }
      return true;
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
        position: 'relative',
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
        {isEditing ? (
          <>
            <input
              type="text"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              className="edit-input"
            />
            <button onClick={handleEditTask} className="save-btn">
              Save
            </button>
          </>
        ) : (
          <span className={`task-text ${task.completed ? 'crossed-off' : ''}`}>{task.text}</span>
        )}
        <div
          className="task-icons"
          style={{
            display: 'flex',
            gap: '10px',
            marginLeft: 'auto',
          }}
        >
          <FontAwesomeIcon
            icon={faPencilAlt}
            title="Edit Task"
            onClick={handleEditToggle}
            className="action-icon edit-icon"
            style={{ color: '#b0a3d4', cursor: 'pointer', fontSize: '1.33em' }}
          />
          <FontAwesomeIcon
            icon={faTrash}
            title="Delete Task"
            onClick={handleDeleteTask}
            className="action-icon delete-icon"
            style={{ color: '#b0a3d4', cursor: 'pointer', fontSize: '1.33em' }}
          />
        </div>
      </div>

      {/* Render Subtasks */}
      {isExpanded && Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
        <div className="subtask-list">
          {task.subtasks.map((subtask) => (
            <Task key={subtask.id} task={subtask} level={level + 1} setLists={setLists} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Task;
