import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPage.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include credentials (cookies)
        body: JSON.stringify({ email, password }),
      });

      // Parse the response JSON
      const data = await response.json();
      console.log('Login response:', data);  // Debugging: Output login response data

      if (response.ok) {
        if (data.user && data.user.id) {
          // Make sure the response contains user data
          console.log('Setting user:', data.user);  // Debugging: Log the user data being set
          onLogin(data.user); // Set user in App state
          navigate('/home'); // Navigate to home page after successful login
        } else {
          setError('Failed to retrieve user details.');
        }
      } else {
        setError(data.error || 'Failed to log in. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Network error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Log In</h2>
        {error && <p className="error-message" style={{ color: '#e74c3c', fontWeight: 'bold' }}>{error}</p>}
        <form className="auth-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="auth-button">Log In</button>
        </form>
        <button
          className="switch-auth"
          onClick={() => navigate('/signup')}
        >
          Don't have an account? Sign Up
        </button>
      </div>
    </div>
  );
}

export default Login;
