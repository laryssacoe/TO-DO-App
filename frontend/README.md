# Task Management Web Application 

This is a **Task Management Application** built with web technologies, providing users with an intuitive and efficient way to manage their daily tasks. Users can create, edit, delete, and track the status of their tasks, helping them stay organized and productive. Tasks can have additional subtasks that allow users to tackle their problems breaking them down one by one to complete the task. 

## Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Usage/Examples](#usageexamples)
- [Functionality](#functionality)
- [Demonstration](#demonstration)
- [Acknowledgements](#acknowledgments)
- [AI Statement](#ai-statement)

## About the Project
This app is designed to help you organize your daily activities with ease. Whether you are managing personal tasks, collaborating on team projects, or keeping track of multiple to-do lists, this application provides an intuitive platform to streamline your productivity.

With the ability to create, edit, and manage tasks across different lists, and being able to also edit, and delete your lists, with a quick user UI, you can stay on top of everything from simple to-do items to complex project tasks. Signing up and logging in is straightforward, allowing you to securely access your tasks anywhere. Features like task prioritization, adding subtasks, and checking completed tasks help you make the most out of your day, week, month, or simply project.

## Tech Stack

<h3 align="left">Languages and Tools:</h3>
<p align="left">
  <a href="https://www.figma.com/" target="_blank" rel="noreferrer">
    <img src="https://www.vectorlogo.zone/logos/figma/figma-icon.svg" alt="figma" width="40" height="40"/> <span style="vertical-align:middle; font-weight:bold;">Figma</span>: Used for initial designing and prototyping the user interface and experience.
  </a>

  &nbsp; &nbsp; 
  <a href="https://reactjs.org/" target="_blank" rel="noreferrer">
    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original-wordmark.svg" alt="React" width="40" height="40"/> <span style="vertical-align:middle; font-weight:bold;">React</span>: JavaScript library for building the user interface with dynamic, interactive components.
  </a>

  &nbsp; &nbsp;
    <a href="https://flask.palletsprojects.com/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/bwks/vendor-icons-svg/702f2ac88acc71759ce623bc5000a596195e9db3/flask.svg" alt="flask" width="40" height="40"/> <span style="vertical-align:middle; font-weight:bold;">Flask</span>: Python framework for the backend, managing APIs and server-side operations.
  </a>

  &nbsp; &nbsp;
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="40" height="40"/> <span style="vertical-align:middle; font-weight:bold;">JavaScript</span>: Combines interactivity and state management in collaboration with React.
  </a>
  
  &nbsp; &nbsp;
    <a href="https://www.python.org" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="python" width="40" height="40"/> <span style="vertical-align:middle; font-weight:bold;">Python</span>: Used on the server-side to handle backend operations and API logic.
  </a>

  &nbsp; &nbsp;
  <a href="https://www.sqlite.org/" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/sqlite/sqlite-icon.svg" alt="sqlite" width="40" height="40"/>
  <span style="vertical-align:middle; font-weight:bold;">SQLite</span>: Lightweight database to store user and task data.
  </a>

  &nbsp; &nbsp;
  <a href="https://www.w3.org/html/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="40" height="40"/>
  <a href="https://developer.mozilla.org/es/docs/Web/CSS" target="_blank" rel="noreferrer"> <img src="https://www.vectorlogo.zone/logos/w3_css/w3_css-icon.svg" alt="CSS" width="40" height="32"/>
  <span style="vertical-align:middle; font-weight:bold;">HTML/CSS</span>: Defines the content structure and styling for a visually appealing and responsive user interface.
  </a>


This tech stack ensures an intuitive frontend with React, a powerful backend using Flask and Python, and simple durable and reliable data storage with SQLite.

## Installation 
To get started with the project, clone the repository and install the dependencies:

1. **Install the lattest version of [Python](https://www.python.org/downloads/)**

2. **If you are using the zip file version, import it into your preferred IDE, otherwise clone the repository the project is available at:**

```bash
git clone <repository-url>
cd task-management-app
```

3. **Create  a virtual environment:**

```bash
  python -m venv venv
```

4. **Install the required packages using requirements.txt:**
```bash
pip install -r requirements.txt
````

5. **Run the backend server and ensure it is working**
```bash 
cd backend
flask run
```

6. **Install Node.js and npm (if you haven't already):**

* **Download and install [Node.js](https://nodejs.org/) (which includes npm). Verify installation:**

```bash
node -v
npm -v
```

7. **Navigate to the frontend directory (e.g., /frontend) and install dependencies:**
```bash
cd frontend
npm install
``` 

8. **Run the React Development Server**
```bash
npm start
```

9. **Open your browser and navigate to http://localhost:3000 to access the app.***


## Project Structure

The project is structured into frontend and backend directories to separate concerns. The **frontend** is built with React, while the **backend** is implemented using Flask.


```bash
task-management-app/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes.py
│   │   ├── models.py
│   │   ├── database.py
│   │   └── tasks.db
│   ├── venv/
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   ├── TaskItem.js
│   │   │   └── TaskList.js
│   │   ├── Pages/
│   │   │   ├── HomePage.js
│   │   │   ├── Login.js
│   │   │   └── SignUp.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── README.md
```

### Description of Folders and Files
* backend/: Contains all the backend server logic.
    * init.py: Initializes the Flask application instance.
    * routes.py: Defines the API endpoints that the frontend interacts with (e.g., create, edit, delete tasks).
    * models.py: Defines the data models for tasks using SQLAlchemy, which interacts with the database.
    * database.py: Establishes the database connection and manages migrations.
    * tasks.db: Stores the tasks in a relational SQLite database.
* venv/: Holds the virtual environment for backend Python dependencies to ensure a consistent development environment.
* requirements.txt: Lists all the Python packages required to run the backend (e.g., Flask, SQLAlchemy).
* run.py: Entry point to run the backend server with Flask.


* frontend/: Contains the client-side application that users interact with.

    * public/: Contains static assets accessible to the browser, including index.html, which is the root of the app.
    * src/:
        * Components/: Contains all reusable components for the user interface:
            * Header.js: Renders the top navigation bar of the application, including log-in/log-out buttons.
            * Sidebar.js: Provides navigation for managing different task lists.
            * TaskItem.js: Displays individual tasks, allowing actions like marking as complete, editing, and deleting.
            * TaskList.js: Groups tasks and allows users to manage and organize them.
        * Pages/: Full pages rendered by the React Router:
            * HomePage.js: Main page where users can view and manage tasks.
            * Login.js: User authentication page to sign in to the application.
            * SignUp.js: Page for new users to register for an account.
        * App.js: Central component managing the app layout and routes.
        * App.css: Contains global styles to provide a consistent look and feel.
        * index.js: The root JavaScript file that boots up the React application.
    * package.json: Manages the dependencies of the React project, such as React Router and other essential libraries.
    * README.md: Documentation to explain the features, installation, and usage of the frontend.


### Summary
This organized structure allow a developer to clearly differentiate between backend and frontend elements, making it easier to maintain and extend the system. The frontend handles the user experience, while the backend manages data storage, retrieval, and business logic. Both sections work in tandem to deliver an effective and seamless task management tool.

## Functionality
The Task Management Application provides a variety of useful functionalities to help users manage their tasks efficiently. Those are organized within a backend and frontend logic as some examples:

1. **List and Task Creation**
* The logic for creating new lists and tasks is handled in TaskList.js, which contains functions that interact with the backend to add items to the database.
*Example Code:*

```bash
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
```

2. **Drag-and-Drop Task Movement**
* Tasks can be dragged from one list to another. The code uses react-dnd to allow users to drag and drop tasks between different lists.
*Example Code:*

```bash
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
```

3. **List Deletion**
* Users can manage different lists and have the ability to create, edit and delete one by one as well as deleting all lists of a user.items to the database.
*Example Code:*

```bash
const handleDeleteAllLists = async () => {
    const confirmed = window.confirm("Are you sure you want to delete all lists? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:4000/delete_all_lists`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        setLists([]); 
      } else {
        console.error('Error deleting all lists:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    }
  };
```



## Demonstration
This set of features available in the task management app ensures users can manage their time effectively, stay on track, and easily navigate through tasks, leading to increased productivity.

* **User Authentication**: Secure sign-up and login using credentials, allowing personalized task management.
![Imgur](https://i.imgur.com/pAybjf3.png)

* **List Creation**: Create multiple task lists to categorize different projects, themes, or types of activities.
![Imgur](https://i.imgur.com/zWBHpZm.png)

* **Task and Subtask Management**:
Add new tasks to any list and create subtasks under those tasks.
![Imgur](https://i.imgur.com/KlFU6KH.png)


* **Edit or delete tasks and subtasks.**
Move tasks between different lists with drag-and-drop functionality.
![Imgur](https://i.imgur.com/GO9pAbp.png)

* **Task Completion Tracking**:
Mark tasks as completed to keep track of progress.
![Imgur](https://i.imgur.com/hE4srIh.png)

* **Responsive UI**: The UI is designed for ease of use with intuitive features, such as expand/collapse tasks to manage subtasks effectively.
![Imgur](https://i.imgur.com/uKYwzu9.png)

This set of features ensures users can manage their time effectively, stay on track, and easily navigate through tasks, leading to increased productivity.
To see the application in action, check out the demonstration video showcasing the various features of the Task Management Application. In this video, I demonstrate the process of signing up, logging in, creating and managing lists, adding tasks and subtasks, marking tasks as completed, and using the drag-and-drop feature to organize tasks across different lists.

This demonstration highlights how the application can enhance productivity by providing an intuitive platform for task organization.

[Youtube Link](https://youtu.be/GscQF1KfJ0I) or [Google Drive File](https://drive.google.com/file/d/1Ka1y5ZjideVvEaRueP67ViPVoNGw9BNv/view?usp=sharing).


## Acknowledgments
I would like to acknowledge the support of peers in collaborating in this project. 

## AI Statement
Some elements of this project, such as code debugging and documentation improvements, were assisted by AI tools like  ChatGPT, which facilitated troubleshooting, and contributed to optimizing the development process.