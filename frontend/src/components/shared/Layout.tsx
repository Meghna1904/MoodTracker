import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useCoach } from '../../context/CoachContext';
import { useTheme } from '../../context/ThemeContext';

const Layout: React.FC = () => {
  const { flash, clearFlash } = useCoach();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="coach-app-shell">
      <Sidebar />
      <div className="coach-main-shell">
        <header className="coach-topbar">
          <NavLink className="app-back-link" to="/dashboard">← Today</NavLink>
          <NavLink className="app-brand" to="/dashboard">
            <span className="app-brand-mark">◌</span>
            <strong>realistic</strong>
          </NavLink>

          <div className="coach-topbar-actions">
            <nav className="app-nav" aria-label="Main navigation">
              <NavLink to="/dashboard">Today</NavLink>
              <NavLink to="/plan">Plan</NavLink>
              <NavLink to="/history">History</NavLink>
            </nav>
            <button className="coach-topbar-button" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <NavLink className="app-settings-link" to="/settings">Settings</NavLink>
          </div>
        </header>

        <main className="coach-content">
          {flash && (
            <div className={`coach-flash coach-flash-${flash.tone}`}>
              <span>{flash.text}</span>
              <button className="coach-link-button" onClick={clearFlash}>Dismiss</button>
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
