import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import Task from './TaskItem';
import './TaskList.css';

function TaskList({ list, newTaskTexts, handleNewTaskChange, handleAddTask, onMoveTask, setLists }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [listState, setListState] = useState(list);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: (item) => {
      console.log("LIST TO CHECK", list);
      console.log(`Dropped item from list ${item.fromListId} to ${list.id}`);
      console.log("ITEM TO CHECK", item);
  
      if (item.fromListId !== list.id) {
        // Use setLists to update both the origin and destination lists immutably
        setLists((prevLists) => {
          let movedTask = null;
  
          // Create a new updatedLists array to avoid mutating prevLists
          const updatedLists = prevLists.map((listItem) => {
            if (listItem.id === item.fromListId) {
              // Remove the task from the original list immutably
              const updatedTasks = listItem.tasks.filter((task) => {
                if (task.id === item.taskId) {
                  movedTask = task; // Capture the moved task
                  return false; // Remove the task from the original list
                }
                return true; // Keep other tasks
              });
  
              return {
                ...listItem,
                tasks: updatedTasks,
              };
            } else if (listItem.id === list.id) {
              // Add the task to the destination list immutably
              return {
                ...listItem,
                tasks: movedTask ? [...listItem.tasks, movedTask] : listItem.tasks,
              };
            }
            return listItem; // Return unchanged lists
          });
  
          if (movedTask) {
            console.log("Task moved successfully to list", list.id);
          } else {
            console.error("Task not found in the list to move");
          }
  
          return updatedLists;
        });
  
        // Optionally, make a backend call to persist the move
        onMoveTask(item.taskId, list.id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));  

  useEffect(() => {
    setListState(list);
  }, [list]);

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // Helper function to render tasks recursively, avoiding re-rendering or duplication.
  const renderTasks = (tasks, level = 1) => {
    if (!Array.isArray(tasks)) {
      return null;
    }
    return tasks.map((task) => (
      <React.Fragment key={task.id}>
        <Task
          task={task}
          level={level}
          onAddSubtask={handleAddTask}
          listId={list.id}
          setLists={setLists}
        />
      </React.Fragment>
    ));
  };

  return (
    <div className="list-container">
      {/* Title with Expand/Collapse Toggle */}
      <div className="list-header">
        <button className="toggle-button" onClick={handleToggleExpand}>
          {isExpanded ? '-' : '+'}
        </button>
        <h3 className="list-title">{list.name}</h3>
      </div>
      {/* Render Tasks under each List */}
      {isExpanded && (
        <div
          ref={drop}
          className="task-list"
          style={{
            backgroundColor: isOver ? '#e0f7fa' : 'transparent',
          }}
        >
          {Array.isArray(listState.tasks) && listState.tasks.length > 0 ? (
            renderTasks(listState.tasks) // Use helper function to render tasks and their subtasks recursively
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