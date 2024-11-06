import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Components/Sidebar';
import TaskList from '../Components/TaskList';
import Header from '../Components/Header';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Home.css';

function Home({ user, tasks, setTasks, onLogout }) {
  const [newListName, setNewListName] = useState('');
  const [newTaskTexts, setNewTaskTexts] = useState({});
  const [, setRefresh] = useState(false);
  const [lists, setLists] = useState(tasks || []);

  // Refs for scrolling
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const listRefs = useRef({}); // Object to store refs for each list

  useEffect(() => {
    if (user) {
      // Update directly instead of appending to avoid duplicates
      setLists(tasks);
    }
  }, [tasks, user]);
  
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
  }, [setTasks, user]); // if bug, take this out 

  const handleNewListChange = (e) => {
    setNewListName(e.target.value);
  };

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
  
  

  const handleNewTaskChange = (listId, text) => {
    setNewTaskTexts((prevState) => ({
      ...prevState,
      [listId]: text,
    }));
  };

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
        setRefresh(prev => !prev);
      } else {
        console.error('Failed to update task:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Scroll to top handler
  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom handler
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
        {/* Top ref for scrolling */}
        <div ref={topRef}></div>

        <Sidebar
          className="sidebar"
          lists={lists}
          onAddList={handleAddList}
          newListName={newListName}
          onNewListNameChange={handleNewListChange}
          setLists={setLists}
          onListClick={scrollToList} // Pass the scroll handler to Sidebar
        />

        <header className="header">Dashboard</header>
        <div className="scroll-buttons">
          <button className="scroll-btn" onClick={scrollToBottom}>Scroll to Bottom</button>
        </div>
        <div className="content-container">
          <div className="main-content">
            {Array.isArray(lists) && lists.length > 0 ? (
              lists.map((list) => (
                <div
                  key={list.id}
                  ref={(el) => (listRefs.current[list.id] = el)} // Assign ref for each list
                >

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

        {/* Buttons to scroll to top and bottom */}
        <div className="scroll-buttons">
          <button className="scroll-btn bottom" onClick={scrollToTop}>Scroll to Top</button>
        </div>

        {/* Bottom ref for scrolling */}
        <div ref={bottomRef}></div>
      </div>
    </DndProvider>
  );
}

export default Home;
