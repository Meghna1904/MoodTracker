import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useCoach } from '../../context/CoachContext';

const Layout: React.FC = () => {
  const { flash, clearFlash, phaseLabel, cycleDay } = useCoach();

  return (
    <div className="coach-app-shell">
      <Sidebar />
      <div className="coach-main-shell">
        <header className="coach-topbar">
          <div>
            <p className="coach-label">The Strict Friend</p>
            <strong>{phaseLabel} • Day {cycleDay}</strong>
          </div>

          <div className="coach-topbar-actions">
            <button className="coach-topbar-button">History</button>
            <button className="coach-topbar-button">Settings</button>
            <div className="coach-topbar-profile">AR</div>
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
