import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoach } from '../context/CoachContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, routines, completionRate, streakDays, adjustMyDay } = useCoach();

  const taskCards = tasks.slice(0, 2);
  const routineCards = routines.slice(0, 3);

  return (
    <div className="coach-page">
      <section className="coach-hero">
        <div>
          <p className="coach-kicker">Friday • Daily pulse</p>
          <h1 className="coach-title">Balance discipline with reality.</h1>
          <p className="coach-copy">
            Today is not a free pass. It is a constrained adjustment window with clear rules.
          </p>
        </div>

        <div className="coach-panel coach-metric-card">
          <span className="coach-label">Overall completion</span>
          <div className="coach-metric-row">
            <strong>{completionRate}%</strong>
            <span>{streakDays} day streak</span>
          </div>
          <div className="coach-progress-track">
            <div className="coach-progress-fill" style={{ width: `${completionRate}%` }} />
          </div>
          <p className="coach-footnote">Structure creates freedom. Adjustments do not erase accountability.</p>
        </div>
      </section>

      <section className="coach-panel coach-checkin-banner">
        <div>
          <p className="coach-label">Life check-in</p>
          <h2>Not feeling your best?</h2>
          <p className="coach-copy-muted">
            Log the truth, then let the system offer valid moves without letting the day collapse.
          </p>
        </div>
        <div className="coach-checkin-actions">
          <button className="coach-button coach-button-primary" onClick={() => adjustMyDay()}>
            Adjust My Day
          </button>
          <button className="coach-button coach-button-secondary" onClick={() => navigate('/mood-cycle')}>
            Update check-in
          </button>
        </div>
      </section>

      <section className="coach-grid coach-grid-dashboard">
        <div className="coach-stack-lg">
          <div className="coach-section-header">
            <div>
              <p className="coach-label">Flexible work</p>
              <h2>Tasks</h2>
            </div>
            <div className="coach-inline-badge">Never past deadline</div>
          </div>

          <div className="coach-stack-md">
            {taskCards.map((task) => (
              <article key={task.id} className="coach-panel coach-list-card">
                <div className="coach-list-topline">
                  <h3>{task.title}</h3>
                  <span className="coach-chip">{task.priority}</span>
                </div>
                <p className="coach-copy-muted">{task.description}</p>
                <div className="coach-list-footer">
                  <span>{Math.max(0, task.moveLimit - task.movesUsed)}/{task.moveLimit} moves left</span>
                  <button className="coach-button coach-button-ghost" onClick={() => navigate('/tasks')}>
                    Review move options
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="coach-stack-lg">
          <div className="coach-section-header">
            <div>
              <p className="coach-label">Fixed habits</p>
              <h2>Routines</h2>
            </div>
            <div className="coach-inline-badge coach-inline-badge-muted">Done / Skipped / Missed</div>
          </div>

          <div className="coach-stack-md">
            {routineCards.map((routine) => (
              <article key={routine.id} className="coach-panel coach-list-card">
                <div className="coach-list-topline">
                  <h3>{routine.title}</h3>
                  <span className={`coach-chip ${routine.status === 'Done' ? 'is-success' : ''}`}>
                    {routine.status}
                  </span>
                </div>
                <div className="coach-list-footer">
                  <span>{routine.progress}/{routine.target}</span>
                  <button className="coach-button coach-button-secondary" onClick={() => navigate('/routines')}>
                    Log status
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="coach-bento">
        <div className="coach-panel coach-panel-dark coach-quote-card">
          <p className="coach-label">Coach&apos;s perspective</p>
          <h2>Discipline is not punishment. It is protection against your own drift.</h2>
          <p className="coach-copy-muted">
            The system bends when reality demands it and hardens when avoidance takes over.
          </p>
        </div>

        <div className="coach-panel coach-panel-accent coach-badge-card">
          <span className="coach-label">Momentum</span>
          <strong>{streakDays.toString().padStart(2, '0')}</strong>
          <p>Day streak</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
