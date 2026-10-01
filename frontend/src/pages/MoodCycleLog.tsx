import React from 'react';
import { useCoach } from '../context/CoachContext';

const moodTags = ['Grounded', 'Analytical', 'Reactive', 'Depleted'] as const;

const MoodCycleLog: React.FC = () => {
  const { energy, mood, cycleDay, phaseLabel, setEnergy, setMood, setCycleDay } = useCoach();

  const forecast = [
    { label: 'Mon', height: '45%' },
    { label: 'Tue', height: '38%' },
    { label: 'Wed', height: '22%', active: energy <= 2 },
    { label: 'Thu', height: '18%' },
    { label: 'Fri', height: '26%' },
    { label: 'Sat', height: '62%' },
    { label: 'Sun', height: '78%' },
  ];

  return (
    <div className="coach-page">
      <section className="coach-hero">
        <div>
          <p className="coach-kicker">Life check-in</p>
          <h1 className="coach-title">Energy & Cycle</h1>
          <p className="coach-copy">
            Track biological context without surrendering agency. The system adapts to your body, not your excuses.
          </p>
        </div>

        <div className="coach-panel coach-metric-card">
          <span className="coach-label">Current state</span>
          <div className="coach-metric-row">
            <strong>Day {cycleDay}</strong>
            <span>{phaseLabel}</span>
          </div>
          <div className="coach-progress-track">
            <div className="coach-progress-fill" style={{ width: `${(cycleDay / 28) * 100}%` }} />
          </div>
          <p className="coach-footnote">Defensive mode recommended. Shift from expansion to refinement.</p>
        </div>
      </section>

      <section className="coach-grid coach-grid-cycle">
        <div className="coach-stack-lg">
          <div className="coach-panel">
            <div className="coach-section-header">
              <div>
                <p className="coach-label">Status input</p>
                <h2>Check-in telemetry</h2>
              </div>
              <div className="coach-inline-badge">Low-energy mode available</div>
            </div>

            <div className="coach-stack-md">
              <div>
                <p className="coach-label">Energy density</p>
                <div className="coach-segmented-grid">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      className={`coach-segment-button ${level === energy ? 'is-active' : ''}`}
                      onClick={() => setEnergy(level)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="coach-label">Mood state</p>
                <div className="coach-tag-grid">
                  {moodTags.map((tag) => (
                    <button
                      key={tag}
                      className={`coach-tag-button ${tag === mood ? 'is-active' : ''}`}
                      onClick={() => setMood(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="coach-label">Cycle day</p>
                <div className="coach-inline-actions">
                  <button className="coach-button coach-button-muted" onClick={() => setCycleDay(cycleDay - 1)}>
                    Previous day
                  </button>
                  <button className="coach-button coach-button-secondary" onClick={() => setCycleDay(cycleDay + 1)}>
                    Next day
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="coach-panel">
            <div className="coach-section-header slim">
              <div>
                <p className="coach-label">Seven-day forecast</p>
                <h2>Energy Horizon</h2>
              </div>
            </div>

            <div className="coach-forecast-chart">
              {forecast.map((item) => (
                <div key={item.label} className="coach-forecast-bar">
                  <span
                    className={`coach-forecast-fill ${item.active ? 'is-active' : ''}`}
                    style={{ height: item.height }}
                  />
                  <small>{item.label}</small>
                </div>
              ))}
            </div>

            <p className="coach-copy-muted">
              Expect a drop in cognitive endurance midweek. Compress complex work into early slots only.
            </p>
          </div>
        </div>

        <aside className="coach-stack-lg">
          <div className="coach-panel coach-panel-dark">
            <p className="coach-label">Tactical shift</p>
            <h3>Defensive protocol active</h3>
            <div className="coach-stack-sm">
              <div className="coach-stat-row">
                <span>Daily load limit</span>
                <strong>{energy <= 2 ? '55%' : energy === 3 ? '65%' : '80%'}</strong>
              </div>
              <div className="coach-progress-track">
                <div className="coach-progress-fill" style={{ width: energy <= 2 ? '55%' : energy === 3 ? '65%' : '80%' }} />
              </div>
              <p className="coach-copy-muted">
                The app should throttle deep-work expectations rather than pretending all days are equal.
              </p>
            </div>
          </div>

          <div className="coach-panel">
            <p className="coach-label">Active compensations</p>
            <div className="coach-stack-sm">
              <div className="coach-history-item">
                <span className="coach-history-icon">!</span>
                <div>
                  <strong>No-meeting filter</strong>
                  <p>Protect high-friction hours from low-value commitments.</p>
                </div>
              </div>
              <div className="coach-history-item">
                <span className="coach-history-icon">R</span>
                <div>
                  <strong>Task postponement guard</strong>
                  <p>Only valid slots before deadline are offered.</p>
                </div>
              </div>
              <div className="coach-history-item">
                <span className="coach-history-icon">Z</span>
                <div>
                  <strong>Rest hard-stop</strong>
                  <p>Recovery is part of discipline when logged honestly.</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default MoodCycleLog;
