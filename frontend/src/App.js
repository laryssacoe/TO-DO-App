import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Pages/HomePage';
import TasksPage from './Pages/TasksPage';
import SignUp from './Pages/SignUp';
import Login from './Pages/Login';
import Header from './Components/Header';
import './App.css';

function App() {
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
        setTasks(data.lists || []);
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
      console.log('Loaded user from localStorage:', parsedUser);
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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setTasks([]); // Clear tasks on logout
  };

  return (
    <Router>
      <div className="App">
        {user && <Header user={user} onLogout={handleLogout} />}
        <Routes>
          {/* Redirect logged-in users from '/' to '/home' */}
          <Route path="/" element={user ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />

          {/* Signup Route */}
          <Route path="/signup" element={user ? <Navigate to="/home" /> : <SignUp />} />

          {/* Home Page for logged-in users */}
          <Route path="/home" element={user ? <Home user={user} tasks={tasks} setTasks={setTasks} /> : <Navigate to="/" />} />

          {/* Task Page for Specific Task */}
          <Route path="/tasks/:id" element={user ? <TasksPage tasks={tasks} /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;