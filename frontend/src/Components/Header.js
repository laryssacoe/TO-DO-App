import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <div className="header-right">
        <div className="user-profile">
          <img src="default-profile.png" alt="User Profile" className="profile-pic" />
          <span className="username">Username</span>
        </div>
        <div className="auth-buttons">
          <button className="btn sign-up">Sign Up</button>
          <button className="btn log-off">Log Off</button>
        </div>
      </div>
    </header>
  );
}

export default Header;
