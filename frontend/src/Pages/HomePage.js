import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import TaskList from '../Components/TaskList';
import './Home.css';

function Home() {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [newTaskTexts, setNewTaskTexts] = useState({});
  const [refresh, setRefresh] = useState(false);  

  // Fetch lists from the database
  const fetchLists = async () => {
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
        setLists(data.lists);
      } else {
        console.error('Error fetching lists:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Fetch lists when the component mounts
  useEffect(() => {
    fetchLists();
  }, []);

  // Handle input change for new list
  const handleNewListChange = (e) => {
    setNewListName(e.target.value);
  };

  // Adds a new list to the database
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
        setLists((prevLists) => [...prevLists, newList.list]); // Update state with the new list
        setNewListName(''); // Clear input after adding
      } else {
        console.error('Error adding list:', response.status);
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

  // Fetch tasks whenever refresh changes
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        setLists(data);
      }
    };

    fetchTasks();
  }, [refresh]);

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
        credentials: 'include', // Include session cookies to identify user
        body: JSON.stringify({ text: newTaskText, list_id: listId }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setLists((prevLists) =>
          prevLists.map((list) =>
            list.id === listId ? { ...list, tasks: [...list.tasks, newTask.task] } : list
          )
        );
        setNewTaskTexts({ ...newTaskTexts, [listId]: '' }); // Clear the input field for the added task
        setRefresh((prev) => !prev); // Trigger refresh to re-fetch tasks
      } else {
        console.error('Error adding task');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Adds new subtask to a parent task
  const handleAddSubtask = async (parentTaskId, subtaskText) => {
    try {
      const response = await fetch('http://localhost:4000/add_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text: subtaskText, parent_id: parentTaskId }),
      });

      if (response.ok) {
        const newSubtask = await response.json();
        setLists((prevLists) =>
          prevLists.map((list) => ({
            ...list,
            tasks: updateSubtaskInList(list.tasks, parentTaskId, newSubtask.task),
          }))
        );
        setRefresh((prev) => !prev); // Trigger refresh to re-fetch tasks
      } else {
        console.error('Failed to add subtask', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };

  // Helper function to update subtasks in a list
  const updateSubtaskInList = (tasks, parentTaskId, newSubtask) => {
    return tasks.map((task) => {
      if (task.id === parentTaskId) {
        return { ...task, subtasks: [...(task.subtasks || []), newSubtask] };
      }
      return task;
    });
  };

  return (
    <div className="main-container">
      <Sidebar
        className="sidebar"
        lists={lists}
        onAddList={handleAddList}
        newListName={newListName}
        onNewListNameChange={handleNewListChange}
        setLists={setLists}
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
              handleAddSubtask={handleAddSubtask}
              setLists={setLists}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
