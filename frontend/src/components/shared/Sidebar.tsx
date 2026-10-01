import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCoach } from '../../context/CoachContext';

const navItems = [
  { to: '/dashboard', label: 'Today', icon: '◦' },
  { to: '/tasks', label: 'Plan', icon: '—' },
  { to: '/analytics', label: 'History', icon: '⌁' },
];

const Sidebar: React.FC = () => {
  const { adjustMyDay } = useCoach();

  return (
    <aside className="coach-sidebar">
      <div className="coach-sidebar-brand">
        <div className="coach-brand-mark">RC</div>
        <div>
          <p className="coach-brand-title">Realistic Coach</p>
          <p className="coach-brand-subtitle">A little room for reality</p>
        </div>
      </div>

      <nav className="coach-sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `coach-nav-link ${isActive ? 'is-active' : ''}`}
          >
            <span className="coach-nav-icon">{item.icon}</span>
            <span className="coach-nav-title">{item.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/settings"
          className={({ isActive }) => `coach-nav-link ${isActive ? 'is-active' : ''}`}
        >
          <span className="coach-nav-icon">·</span>
          <span className="coach-nav-title">Settings</span>
        </NavLink>
      </nav>

      <div className="coach-sidebar-footer">
        <button className="coach-button coach-button-primary coach-button-full" onClick={() => adjustMyDay()}>
          Adjust my day
        </button>

        <div className="coach-profile-card">
          <div className="coach-profile-avatar">M</div>
          <div>
            <strong>Meghna</strong>
            <span>Personal space</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
