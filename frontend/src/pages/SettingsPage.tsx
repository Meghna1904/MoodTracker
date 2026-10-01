import React, { useState } from 'react';
import { useCoach } from '../context/CoachContext';
import { useTheme } from '../context/ThemeContext';

const SettingsPage: React.FC = () => {
  const { energy, cycleDay, setEnergy, setCycleDay, exportData } = useCoach();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState('Meghna');
  const [saved, setSaved] = useState(false);

  return (
    <div className="coach-page">
      <section className="coach-hero">
        <div>
          <p className="coach-kicker">Preferences</p>
          <h1 className="coach-title">Make it yours.</h1>
          <p className="coach-copy">A quiet place to decide what the system should remember and what it should leave alone.</p>
        </div>
      </section>
      <section className="coach-grid coach-grid-routines">
        <div className="coach-stack-lg">
          <div className="coach-panel">
            <div className="coach-section-header slim"><div><p className="coach-label">Profile</p><h2>Basics</h2></div></div>
            <label className="onboarding-field">Name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
            <button className="coach-button coach-button-primary" onClick={() => setSaved(true)}>{saved ? 'Saved' : 'Save changes'}</button>
          </div>
          <div className="coach-panel">
            <p className="coach-label">Display</p>
            <h2>Theme & context</h2>
            <div className="coach-inline-actions">
              <button
                className={`coach-button ${theme === 'light' ? 'coach-button-primary' : 'coach-button-secondary'}`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                className={`coach-button ${theme === 'dark' ? 'coach-button-primary' : 'coach-button-secondary'}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
            </div>
            <div className="coach-stack-sm">
              <div className="coach-stat-row"><span>Energy baseline</span><strong>{energy}/5</strong></div>
              <input type="range" min="1" max="5" value={energy} onChange={(event) => setEnergy(Number(event.target.value))} />
              <div className="coach-stat-row"><span>Cycle day</span><strong>{cycleDay}</strong></div>
              <input type="range" min="1" max="28" value={cycleDay} onChange={(event) => setCycleDay(Number(event.target.value))} />
            </div>
          </div>
        </div>
        <aside className="coach-stack-lg">
          <div className="coach-panel">
            <p className="coach-label">Data</p>
            <h2>Keep your record portable.</h2>
            <p className="coach-copy-muted">Export a readable copy of your current local state whenever you want.</p>
            <button className="coach-button coach-button-secondary coach-button-full" onClick={exportData}>Export data</button>
          </div>
          <div className="coach-panel coach-panel-dark">
            <p className="coach-label">Privacy</p>
            <h3>Your signals are yours.</h3>
            <p className="coach-copy-muted">The coach should explain a suggestion, never make a decision behind your back.</p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default SettingsPage;
