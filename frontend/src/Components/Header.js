// This Header component is a simple component that displays the user's name and provides buttons for signing up, logging in, and logging out.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  // Handle navigation to the login page for logging out
  const handleNavigation = (path) => {
    if (user) {
      onLogout(); // Log out the user before navigating
    }
    navigate(path);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {user && <span className="username">Welcome, {user.username}</span>}
      </div>
      <div className="header-right">
        <button className="btn sign-up" onClick={() => handleNavigation('/signup')}>Sign Up</button>
        <button className="btn log-in" onClick={() => handleNavigation('/')}>Log In</button>
        {user && (
          <button className="btn log-out" onClick={onLogout}>Log Out</button>
        )}
      </div>
    </header>
  );
}

export default Header;