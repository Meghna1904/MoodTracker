import React, { useState } from 'react';
import { useCoach } from '../context/CoachContext';

const RoutinesPage: React.FC = () => {
  const { routines, honestyRate, streakDays, updateRoutineStatus } = useCoach();
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState('');

  return (
    <div className="coach-page">
      <section className="coach-hero">
        <div>
          <p className="coach-kicker">Daily non-negotiables</p>
          <h1 className="coach-title">Routine Tracker</h1>
          <p className="coach-copy">
            Routines do not move. They get done, skipped with honesty, or missed and recorded.
          </p>
        </div>

        <div className="coach-panel coach-metric-card">
          <span className="coach-label">Today&apos;s honesty rate</span>
          <div className="coach-metric-row">
            <strong>{honestyRate}%</strong>
            <span>{streakDays} day streak</span>
          </div>
          <div className="coach-progress-track">
            <div className="coach-progress-fill" style={{ width: `${honestyRate}%` }} />
          </div>
          <p className="coach-footnote">Grace skips are allowed. Quiet excuses are not.</p>
        </div>
      </section>

      <section className="coach-grid coach-grid-routines">
        <div className="coach-stack-lg">
          <div className="coach-section-header">
            <div>
              <p className="coach-label">Execution log</p>
              <h2>Daily Non-Negotiables</h2>
            </div>
            <div className="coach-inline-badge">Done / Skipped / Missed</div>
          </div>

          <div className="coach-stack-md">
            {routines.map((routine) => {
              const isEditing = editingRoutineId === routine.id;

              return (
                <article key={routine.id} className="coach-panel coach-routine-card">
                  <div className="coach-routine-copy">
                    <h3>{routine.title}</h3>
                    <p>{routine.reason ? `Reason logged: ${routine.reason}` : routine.description}</p>
                  </div>
                  <div className="coach-routine-actions">
                    <button className="coach-button coach-button-primary" onClick={() => updateRoutineStatus(routine.id, 'Done')}>
                      Done
                    </button>
                    <button
                      className="coach-button coach-button-secondary"
                      onClick={() => {
                        setEditingRoutineId(routine.id);
                        setReasonDraft(routine.reason ?? '');
                      }}
                    >
                      Skipped
                    </button>
                    <button className="coach-button coach-button-muted" onClick={() => updateRoutineStatus(routine.id, 'Missed')}>
                      Missed
                    </button>
                  </div>
                  <div className="coach-status-row">
                    <span className={`coach-chip ${routine.status === 'Done' ? 'is-success' : ''}`}>
                      {routine.status}
                    </span>
                    <button className="coach-link-button" onClick={() => setEditingRoutineId(isEditing ? null : routine.id)}>
                      {isEditing ? 'Close log' : 'Edit log'}
                    </button>
                  </div>
                  {isEditing && (
                    <div className="coach-inline-panel">
                      <p className="coach-label">Skip reason</p>
                      <textarea
                        className="coach-textarea"
                        rows={3}
                        value={reasonDraft}
                        onChange={(event) => setReasonDraft(event.target.value)}
                        placeholder="Log the reason honestly."
                      />
                      <div className="coach-inline-actions">
                        <button
                          className="coach-button coach-button-secondary"
                          onClick={() => updateRoutineStatus(routine.id, 'Skipped', reasonDraft || 'Skipped without detail')}
                        >
                          Save skip
                        </button>
                        <button className="coach-button coach-button-muted" onClick={() => setEditingRoutineId(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="coach-stack-lg">
          <div className="coach-panel coach-panel-accent">
            <p className="coach-label">Current momentum</p>
            <strong>{streakDays}</strong>
            <p>Day streak</p>
            <div className="coach-dot-grid">
              {Array.from({ length: Math.max(streakDays, 7) }).map((_, index) => (
                <span key={index} className={`coach-dot ${index < streakDays - 1 ? 'is-filled' : 'is-current'}`} />
              ))}
            </div>
          </div>

          <div className="coach-panel">
            <div className="coach-section-header slim">
              <div>
                <p className="coach-label">Integrity snapshot</p>
                <h2>Consistency</h2>
              </div>
            </div>

            <div className="coach-stack-sm">
              <div className="coach-stat-row">
                <span>Honesty rate</span>
                <strong>{honestyRate}%</strong>
              </div>
              <div className="coach-stat-row">
                <span>Current streak</span>
                <strong>{streakDays} days</strong>
              </div>
              <div className="coach-stat-row">
                <span>Grace skips today</span>
                <strong>{routines.filter((routine) => routine.status === 'Skipped').length}</strong>
              </div>
            </div>
          </div>

          <div className="coach-panel coach-panel-dark">
            <p className="coach-label">Coach&apos;s note</p>
            <h3>Routines are identity work.</h3>
            <p className="coach-copy-muted">
              When the day gets hard, the humane response is a logged skip, not a disappearing habit.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default RoutinesPage;
