import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();

  console.log('User data in Header:', user); // Debug statement

  return (
    <header className="app-header">
      <div className="header-left">
          <span className="username">Welcome, {user.username}</span>
      </div>
      <div className="header-right">
        {user ? (
          <button className="btn log-off" onClick={onLogout}>Log Off</button>
        ) : (
          <>
            <button className="btn sign-up" onClick={() => navigate('/signup')}>Sign Up</button>
            <button className="btn log-in" onClick={() => navigate('/login')}>Login</button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
