// This component represents a single task item in the task list.
// It displays the task text, completion status, and provides buttons to edit, delete, and add subtasks.

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDrag } from 'react-dnd';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import './TaskList.css';

function Task({ task, level, fetchLists, setLists, lists, listId }) {

  // State definitions
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [taskText, setTaskText] = useState(task.text);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Drag and drop functionality for tasks (drag only)
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TASK', 
    item: { taskId: task.id, fromListId: listId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Helper function to update tasks and their subtasks immutably
  const updateTaskAndSubtasks = (tasks, taskId, updates) => {
    return tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: updateTaskAndSubtasks(task.subtasks, taskId, updates), // Recursively update subtasks
        };
      }
      return task;
    });
  };

  // Helper function to add a subtask to a parent task immutably
  const addSubtaskToTask = (tasks, parentTaskId, newSubtask) => {
    return tasks.map((task) => {
      if (task.id === parentTaskId) {
        return {
          ...task,
          subtasks: [...(task.subtasks || []), newSubtask],
        };
      }
      if (task.subtasks && task.subtasks.length > 0) {
        return {
          ...task,
          subtasks: addSubtaskToTask(task.subtasks, parentTaskId, newSubtask), // Recursively add subtask
        };
      }
      return task;
    });
  };

  // Helper function to delete a task or subtask immutably
  const deleteTaskOrSubtask = (tasks, taskId) => {
    return tasks
      .filter((task) => task.id !== taskId)
      .map((task) => ({
        ...task,
        subtasks: task.subtasks ? deleteTaskOrSubtask(task.subtasks, taskId) : [], // Recursively delete subtasks
      }));
  };

  // Toggle expand/collapse of subtasks
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Toggle completion status of the task
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
            tasks: updateTaskAndSubtasks(list.tasks, task.id, { completed: newCompletedStatus }), // Update task and subtasks
          }))
        );
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Toggle edit mode for the task
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Update the task text in the backend and state
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

  // Delete the task from the backend and state
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
            tasks: deleteTaskOrSubtask(list.tasks, task.id),
          }))
        );
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Add a new subtask to the task
  const handleAddSubtask = async () => {
    if (newSubtaskText.trim() === '') return;

    try {
      const response = await fetch(`http://localhost:4000/add_task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        // Send the new subtask text, parent task ID, and list ID
        body: JSON.stringify({
          text: newSubtaskText,
          parent_id: task.id,
          list_id: task.list_id,
        }),
      });
      if (response.ok) {
        const newSubtask = await response.json();
        // Update the state with the new subtask
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            tasks: addSubtaskToTask(list.tasks, task.id, newSubtask.task),
          }))
        );
        setNewSubtaskText('');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div
        className={`task-item ${task.completed ? 'completed-item' : ''}`}
        style={{
          marginBottom: '15px',
          marginLeft: `${level * 10}px`, 
          padding: '10px',
          borderLeft: '2px solid #ccc',
          borderRadius: '5px',
          position: 'relative',
        }}
      >
        <div className="task-details">
          {/* Render task text, completion status, and action buttons */}
          <button onClick={handleToggleExpand} className="toggle-button">
            {isExpanded ? '-' : '+'}
          </button>
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.completed}
            onChange={handleCompletionToggle}
          />

          {/* Render task text or input field based on edit mode */}
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

            {/* Edit and Delete Task Actions */}
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

        {/* Render Subtasks Recursively */}
        {isExpanded && Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
          <div className="subtask-list">
            {task.subtasks.map((subtask) => (
              <Task
                key={subtask.id}
                task={subtask}
                level={level + 1}
                fetchLists={fetchLists}
                setLists={setLists}
                lists={lists}
              />
            ))}
          </div>
        )}

        {/* Add Subtask Section (would allow for infinite recursion, but in order to prevent an infinite mirroring we limit the rendering to depth 3 subtasks) */}
        {level < 3 && (
          <div className="add-task">
            <input
              type="text"
              placeholder="Add new subtask..."
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              className="new-task-input"
              style={{ marginTop: '5px' }}
            />
            <button onClick={handleAddSubtask} className="add-task-btn">
              Add Subtask
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Task;