import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import TaskList from '../Components/TaskList';
import './Home.css';

function Home() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskTexts, setNewTaskTexts] = useState({});

  // Fetch lists from the database
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
        setLists(data.lists || []); // Sets the lists state with fetched data
      } else {
        console.error('Failed to fetch lists', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  // Handle input change for new list
  const handleNewListChange = (e) => {
    setNewListName(e.target.value);
  };

  // Adds a new list to the database
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
        fetchLists(); // Refetch lists after adding a new one
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
    setNewTaskTexts((prevState) => ({
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
        fetchLists(); // Refetch lists after adding a new task
        setNewTaskTexts({ ...newTaskTexts, [listId]: '' });
      } else {
        console.error('Error adding task');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  return (
    <div className="main-container">
      <Sidebar
        className="sidebar"
        lists={lists}
        onAddList={handleAddList}
        newListName={newListName}
        onNewListNameChange={handleNewListChange}
      />

      <header className="header">Dashboard</header>
      <div className="content-container">
        {/* Main Content */}
        <div className="main-content">
          {lists.map((list) => (
            <TaskList
              key={list.id}
              list={list}
              newTaskTexts={newTaskTexts}
              handleNewTaskChange={handleNewTaskChange}
              handleAddTask={handleAddTask}
              fetchLists={fetchLists} // Pass fetchLists to re-fetch the updated tasks
              setLists={setLists}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
