/* This file containes the home page of the application. 
It essentially renders the header, the sidebar and the list structure of the app.
The main functions are to add a new list, add a new task, move a task to a different list, and scroll to the top or bottom of the page. */ 

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import TaskList from '../Components/TaskList';
import Header from '../Components/Header';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Home.css';

function Home({ user, tasks, setTasks, onLogout }) {

  // State definitions
  const [newListName, setNewListName] = useState('');
  const [newTaskTexts, setNewTaskTexts] = useState({});
  const [, setRefresh] = useState(false);
  const [lists, setLists] = useState(tasks || []);

  // Refs for scrolling
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const listRefs = useRef({}); 

  // Update lists when tasks change automatically
  useEffect(() => {
    if (user) {
      setLists(tasks);
    }
  }, [tasks, user]);
  
  // Fetch tasks for the logged-in user from the server and re-render the lists
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:4000/tasks', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Fetched tasks:', data);
          setTasks(data.lists || []);
        } else {
          console.error('Failed to fetch tasks', response.status);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    fetchTasks();
  }, [setTasks, user]); 

  // Handle a list change as part of the editing and adding list functionalities
  const handleNewListChange = (e) => {
    setNewListName(e.target.value);
  };

  // Add a new list to the database
  const handleAddList = async () => {
    if (!newListName.trim()) return;
  
    try {
      const response = await fetch('http://localhost:4000/add_list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: newListName }),
      });
  
      if (response.ok) {
        const newList = await response.json();
        setLists((prevLists) => [...prevLists.filter((list) => list.id !== newList.list.id), { ...newList.list, tasks: [] }]);
        setNewListName('');
      } else {
        console.error('Error adding list:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Handle a new task change as part of the adding task functionality
  const handleNewTaskChange = (listId, text) => {
    setNewTaskTexts((prevState) => ({
      ...prevState,
      [listId]: text,
    }));
  };

  // Add a new task to the database
  const handleAddTask = async (listId) => {
    const newTaskText = newTaskTexts[listId];
    if (newTaskText?.trim() === '') return;

    try {
      const response = await fetch('http://localhost:4000/add_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: newTaskText, list_id: listId }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, tasks: [...list.tasks, newTask.task] } : list
          )
        );
        setNewTaskTexts({ ...newTaskTexts, [listId]: '' });
      } else {
        console.error('Error adding task');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Move a task to a different list
  const handleMoveTask = async (taskId, destinationListId) => {
    try {
      const response = await fetch(`http://localhost:4000/move_task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ list_id: destinationListId }),
      });

      if (response.ok) {
        console.log(`Task ${taskId} moved successfully to list ${destinationListId}`);
        setRefresh(prev => !prev); // Trigger a re-render after change
      } else {
        console.error('Failed to update task:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Scroll to top button handler
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom button handler
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to specific list handler
  const scrollToList = (listId) => {
    listRefs.current[listId]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Header user={user} onLogout={onLogout} />
      <div className="main-container">
        {/* Ref for scrolling to the top */}
        <div ref={topRef}></div>

        {/* Sidebar for lists, passes functions as props */}
        <Sidebar
          className="sidebar"
          lists={lists}
          onAddList={handleAddList}
          newListName={newListName}
          onNewListNameChange={handleNewListChange}
          setLists={setLists}
          onListClick={scrollToList} 
        />

        <header className="header">Dashboard</header>
        <div className="scroll-buttons">
          {/* Button to scroll to bottom */}
          <button className="scroll-btn" onClick={scrollToBottom}>Scroll to Bottom</button>
        </div>
        <div className="content-container">
          <div className="main-content">
            {Array.isArray(lists) && lists.length > 0 ? (
              lists.map((list) => (
                <div
                  key={list.id}
                  ref={(el) => (listRefs.current[list.id] = el)} // Assign ref for each list for scrolling to specific list from sidebar to dashboard
                >

                  {/* TaskList component to render tasks */}
                  <TaskList
                    list={{ ...list, tasks: Array.isArray(list.tasks) ? list.tasks : [] }}
                    newTaskTexts={newTaskTexts}
                    handleNewTaskChange={handleNewTaskChange}
                    handleAddTask={handleAddTask}
                    onMoveTask={handleMoveTask}
                    setLists={setLists}
                  />
                </div>
              ))
            ) : (
              <p>No lists available</p>
            )}
          </div>
        </div>

        {/* Buttons to scroll to top */}
        <div className="scroll-buttons">
          <button className="scroll-btn bottom" onClick={scrollToTop}>Scroll to Top</button>
        </div>
        <div ref={bottomRef}></div>
      </div>
    </DndProvider>
  );
}

export default Home;