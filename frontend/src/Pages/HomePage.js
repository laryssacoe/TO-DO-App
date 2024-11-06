import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import TaskList from '../Components/TaskList';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './Home.css';

function Home({ user, tasks, setTasks }) {
  const [newListName, setNewListName] = useState('');
  const [newTaskTexts, setNewTaskTexts] = useState({});
  const [refresh, setRefresh] = useState(false);  // <-- Add this line
  const [lists, setLists] = useState(tasks || []);

  useEffect(() => {
    if (user) {
      setLists(tasks);
    }
  }, [tasks, user]);

  // Fetch tasks when the component mounts
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
          setTasks(data.lists || []); // Directly set the fetched data without altering its structure
          console.log('Fetched tasks updated in state:', data.lists);
        } else {
          console.error('Failed to fetch tasks', response.status);
        }
      } catch (error) {
        console.error('Network error:', error);
      }
    };

    fetchTasks();
  }, []);

  const buildTaskHierarchy = (tasks) => {
    const taskMap = {};
    tasks.forEach((task) => {
      taskMap[task.id] = { ...task, subtasks: [] };
    });

    const topLevelTasks = [];
    tasks.forEach((task) => {
      if (task.parent_id) {
        if (taskMap[task.parent_id]) {
          taskMap[task.parent_id].subtasks.push(taskMap[task.id]);
        }
      } else {
        topLevelTasks.push(taskMap[task.id]);
      }
    });

    return topLevelTasks;
  };


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
        setLists((prevLists) => [...prevLists, { ...newList.list, tasks: [] }]);
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
        setRefresh(prev => !prev); // Trigger a refresh to re-fetch tasks and reflect changes
      } else {
        console.error('Failed to update task:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };


  return (
    <DndProvider backend={HTML5Backend}>
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
          <div className="main-content">
            {Array.isArray(lists) && lists.length > 0 ? (
              lists.map((list) => (
                <TaskList
                  key={list.id}
                  list={{ ...list, tasks: Array.isArray(list.tasks) ? list.tasks : [] }}
                  newTaskTexts={newTaskTexts}
                  handleNewTaskChange={handleNewTaskChange}
                  handleAddTask={handleAddTask}
                  onMoveTask={handleMoveTask}
                  setLists={setLists}
                />
              ))
            ) : (
              <p>No lists available</p>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default Home;