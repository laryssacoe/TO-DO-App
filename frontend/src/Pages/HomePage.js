// Imports components and libraries
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Components/Sidebar'; 
import './Home.css';

function Home() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskTexts, setNewTaskTexts] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});

  // Fetches the lists from the database 
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const response = await fetch('http://localhost:4000/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
        });

        if (response.ok) {
          const data = await response.json();
          setLists(data.lists || []); // Sets the lists state with the fetched data
        } else {
          console.error('Failed to fetch lists', response.status);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    fetchLists();
  }, []);

  // Handles input change for new list
  const handleNewListChange = (e) => {
    setNewListName(e.target.value);
  };  

  // Adds new list to the database
  const handleAddList = async () => {
    if (newListName.trim() === '') return;

    try {
      const response = await fetch('http://localhost:4000/add_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName }),
      });

      if (response.ok) {
        const result = await response.json();
        setLists([...lists, result.list]);
        setNewListName('');
      } else {
        console.error('Error adding list');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
  
  // Handle input change for new task
  const handleNewTaskChange = (listId, text) => {
    setNewTaskTexts(prevState => ({
      ...prevState,
      [listId]: text, // Update the input value for the specific list
    }));
  };
  
  // Adds new task to the selected list
  const handleAddTask = async (listId) => {
    const newTaskText = newTaskTexts[listId];
    if (newTaskText?.trim() === '') return;
  
    try {
      const response = await fetch('http://localhost:4000/add_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTaskText, list_id: listId }),
      });
  
      if (response.ok) {
        const result = await response.json();
        setLists(lists.map(list => {
          if (list.id === listId) {
            return {
              ...list,
              tasks: list.tasks ? [...list.tasks, result.task] : [result.task]
            };
          }
          return list;
        }));
        setNewTaskTexts({ ...newTaskTexts, [listId]: '' });
      } else {
        console.error('Error adding task');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  //TODO: Implement the following functions:
  // handleToggleTask
  // handleToggleSubtask
  // handleToggleExpand
  // handleAddSubtask

  return (
    <div className="main-container">
      {/* Sidebar */}
      <Sidebar
        className="sidebar"
        lists={lists}
        onAddList={handleAddList}
        newListName={newListName}
        onNewListNameChange={handleNewListChange}
      />
      
      {/* Content Container */}
      <div className="content-container">
        {/* Header */}
        <header className="header">
          Home Page
        </header>

        {/* Main Content */}
        <div className="main-content">
          {lists.map(list => (
            <div key={list.id} className="list-item">
              <h3>{list.name}</h3>

              {/* Tasks under each List */}
              <ul>
                {Array.isArray(list.tasks) && list.tasks.length > 0 ? (
                  list.tasks.map(task => (
                    <li key={task.id} className={`task-item ${task.completed ? 'completed-item' : ''}`}>
                      <div className="task-header">
                        <span 
                          className="toggle-button" >
                          {/*onClick={() => handleToggleExpand(task.id)}*/}
                          {expandedTasks[task.id] ? '[-]' : '[+]'}
                        </span>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          />
                          {/*onChange={() => handleToggleTask(task.id)} // This function should handle task toggling */}
                        
                        <Link to={`/tasks/${task.id}`} className="task-text">
                          {task.text}
                        </Link>
                      </div>
                      {/* Subtasks */}
                      {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
                        <ul className="subtask-list">
                          {task.subtasks.map(subtask => (
                            <li key={subtask.id} className={`subtask-item ${subtask.completed ? 'completed-item' : ''}`}>
                              <input
                                type="checkbox"
                                checked={subtask.completed}/>
                                {/*onChange={() => handleToggleSubtask(subtask.id)} // This function should handle subtask toggling*/}
                              
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
              {/* Add New Task Section for Selected List */}
              <div className="add-task">
                <input
                  type="text"
                  placeholder="Add new task..."
                  value={newTaskTexts[list.id] || ""} 
                  onChange={(e) => handleNewTaskChange(list.id, e.target.value)} // Passes the selected list id and the input value as arguments
                  className="new-task-input"
                />
                
                <button onClick={() => handleAddTask(list.id)} className="add-task-btn">
                  Add sub-task to {list.name}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

  );
}

export default Home;