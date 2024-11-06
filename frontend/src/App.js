// This file contains the main application component that renders the header and the main content of the app.

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/HomePage';
import SignUp from './Pages/SignUp';
import Login from './Pages/Login';
import Header from './Components/Header';
import './App.css';

function App() {

  // State definitions
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  // Fetches tasks for the logged-in user
  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:4000/tasks', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials (cookies)
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched tasks:', data);

        // Ensure `tasks` is always an array
        if (Array.isArray(data.lists)) {
          const newLists = data.lists.map(list => ({
            ...list,
            tasks: Array.isArray(list.tasks) ? list.tasks : [] 
          }));
          setTasks(newLists);
          console.log('Fetched tasks updated in state:', newLists);
        } else {
          console.error('Unexpected response format:', data);
          setTasks([]);
        }
      } else {
        console.error('Failed to fetch tasks', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Check if the user is already logged in when the app loads
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
    }
  }, []);

  // Fetch tasks when user is logged in
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      // Make a request to invalidate the session
      const response = await fetch('http://localhost:4000/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
      });
  
      if (response.ok) {

        // Clear the client-side session state
        setUser(null);
        localStorage.removeItem('user');
        setTasks([]); // Clear tasks on logout
        console.log('User logged out successfully');
      } else {
        console.error('Logout failed:', response.status);
      }
    } catch (error) {
      console.error('Network error during logout:', error);
    }
  };
  

  return (
    <Router>
      <div className="App">
        <Header user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/home" />} />
          <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/home" />} />
          <Route path="/home" element={user ? <Home user={user} tasks={tasks} setTasks={setTasks} onLogout={handleLogout} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;