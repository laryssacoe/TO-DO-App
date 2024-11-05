import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-left">
        {user && <span className="username">Welcome, {user.username}</span>}
      </div>
      <div className="header-right">
        <button className="btn sign-up" onClick={() => navigate('/signup')}>Sign Up</button>
        <button className="btn log-in" onClick={() => navigate('/')}>Log In</button>
        {user && (
          <button className="btn log-out" onClick={onLogout}>Log Out</button>
        )}
      </div>
    </header>
  );
}

export default Header;
