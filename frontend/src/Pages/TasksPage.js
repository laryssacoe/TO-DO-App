import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

function TasksPage({ tasks }) {
  const { id } = useParams();
  const task = tasks.find(task => task.id === parseInt(id));

  React.useEffect(() => {
    console.log('Tasks received in TasksPage:', tasks);
}, [tasks]);


  if (!task) {
    return <div>Task not found...</div>;
  }


  return (
    <div>
      <h1>{task.text}</h1>
      {/* Render other task details */}
    </div>
  );
}

export default TasksPage;
