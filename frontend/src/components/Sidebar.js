import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>BillSys</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">&#9632;</span>
          Dashboard
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">&#9632;</span>
          Customers
        </NavLink>
        <NavLink to="/plans" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">&#9632;</span>
          Plans
        </NavLink>
        <NavLink to="/subscriptions" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">&#9632;</span>
          Subscriptions
        </NavLink>
        <NavLink to="/invoices" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">&#9632;</span>
          Invoices
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
