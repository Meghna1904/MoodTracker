import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCoach } from '../../context/CoachContext';

const navItems = [
  { to: '/dashboard', label: 'Daily Pulse', meta: 'Today', icon: '◎' },
  { to: '/tasks', label: 'Task Manager', meta: '3-move limit', icon: '→' },
  { to: '/routines', label: 'Routine Tracker', meta: 'Non-negotiables', icon: '□' },
  { to: '/analytics', label: 'Insights', meta: 'Honesty mirror', icon: '△' },
  { to: '/mood-cycle', label: 'Energy & Cycle', meta: 'Life check-in', icon: '◌' },
];

const Sidebar: React.FC = () => {
  const { phaseLabel, cycleDay, honestyRate, adjustMyDay } = useCoach();

  return (
    <aside className="coach-sidebar">
      <div className="coach-sidebar-brand">
        <div className="coach-brand-mark">RC</div>
        <div>
          <p className="coach-brand-title">The Realistic Coach</p>
          <p className="coach-brand-subtitle">Discipline over drama</p>
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
            <div>
              <span className="coach-nav-title">{item.label}</span>
              <span className="coach-nav-meta">{item.meta}</span>
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="coach-sidebar-footer">
        <div className="coach-sidecard">
          <p className="coach-label">Life check-in</p>
          <strong>{phaseLabel} • Day {cycleDay}</strong>
          <span>Defensive mode recommended today.</span>
        </div>

        <button className="coach-button coach-button-primary coach-button-full" onClick={() => adjustMyDay()}>
          Adjust My Day
        </button>

        <div className="coach-profile-card">
          <div className="coach-profile-avatar">AR</div>
          <div>
            <strong>Arwa</strong>
            <span>Honesty rate {honestyRate}%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
