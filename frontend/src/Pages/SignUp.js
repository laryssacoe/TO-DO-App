// This sign up page is a simple form that allows users to sign up for the application.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

function Signup() {

  // State definitions
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Submission of the signup form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      // If the response is successful, display a success message and navigate to the login page
      // Intentionally sent to the login page instead of the home page to ensure the user session is syncronized
      if (response.ok) {
        setMessage('Signup successful. Please log in.');
        navigate('/'); 
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Sign Up</h2>
        {message && <p className="error-message" style={{ color: '#e74c3c' }}>{message}</p>}
        {/* Signup form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        {/* Switch to login page */}
        <button
          className="switch-auth"
          onClick={() => window.location.href = '/'}
        >
          Already have an account? Log In
        </button>
      </div>
    </div>
  );
}

export default Signup;