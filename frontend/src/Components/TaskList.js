import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import Task from './TaskItem';
import './TaskList.css';

function TaskList({ list, newTaskTexts, handleNewTaskChange, handleAddTask, onMoveTask, setLists }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [listState, setListState] = useState(list);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'TASK',
    drop: async (item) => {
      if (item.fromListId !== list.id) {
        setLists((prevLists) => {
          let movedTask = null;
  
          // Step 1: Remove the task from the original list
          const updatedLists = prevLists.map((listItem) => {
            if (listItem.id === item.fromListId) {
              const taskIndex = listItem.tasks.findIndex((task) => task.id === item.taskId);
              if (taskIndex !== -1) {
                movedTask = listItem.tasks[taskIndex];
                return {
                  ...listItem,
                  tasks: [
                    ...listItem.tasks.slice(0, taskIndex),
                    ...listItem.tasks.slice(taskIndex + 1),
                  ],
                };
              }
            }
            return listItem;
          });
  
          // Step 2: Add the task to the destination list
          if (movedTask) {
            return updatedLists.map((listItem) => {
              if (listItem.id === list.id) {
                return {
                  ...listItem,
                  tasks: [...listItem.tasks, movedTask],
                };
              }
              return listItem;
            });
          }
  
          return updatedLists;
        });
  
        // Step 3: Update the backend to reflect the new list assignment for the moved task
        try {
          const response = await fetch(`http://localhost:4000/update_task/${item.taskId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ list_id: list.id }),
          });
  
          if (!response.ok) {
            console.error('Failed to update task list_id in the backend');
          } else {
            console.log('Task moved successfully in the backend');
          }
        } catch (error) {
          console.error('Network error while updating task:', error);
        }
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