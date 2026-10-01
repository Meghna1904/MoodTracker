import React from 'react';
import { Outlet } from 'react-router-dom';
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
          <div>
            <p className="coach-label">Realistic Coach</p>
            <strong>Today</strong>
          </div>

          <div className="coach-topbar-actions">
            <button className="coach-topbar-button" onClick={toggleTheme}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <div className="coach-topbar-profile">M</div>
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
