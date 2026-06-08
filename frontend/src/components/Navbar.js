import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="navbar">
      <div className="navbar-left">
        <span className="navbar-title">Subscription Billing System</span>
      </div>
      <div className="navbar-right">
        <span className="navbar-user">{user?.name}</span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Navbar;
