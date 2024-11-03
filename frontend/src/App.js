// Imports all page components and renders them using react-router-dom
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/HomePage';
import TasksPage from './Pages/TasksPage';
import Header from './Components/Header';
import './App.css';

// Defines the routes for the application and the app component
function App() {

  const [tasks, setTasks] = React.useState([]);

  // Fetches tasks function
  const fetchTasks = async () => {
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
        console.log('Fetched tasks:', data); 
        setTasks(data.lists || []); 
      } else {
        console.error('Failed to fetch tasks', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  React.useEffect(() => {
    fetchTasks();
    console.log("Effect run for fetchTasks");
  }, []);
  
  console.log("App Component Rendered - tasks:", tasks);
  

  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home tasks={tasks} setTasks={setTasks} />} />
          <Route path="/tasks/:id" element={<TasksPage tasks={tasks}/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;