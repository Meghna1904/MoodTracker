import React, { useState } from 'react';
import { useCoach } from '../context/CoachContext';

const RoutinesPage: React.FC = () => {
  const { routines, updateRoutineStatus } = useCoach();
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState('');

  return (
    <div className="coach-page plan-page">
      <section className="plan-intro">
        <p className="os-date">Your routines</p>
        <h1 className="coach-title">Small things, done gently.</h1>
        <p className="coach-copy">Keep the routines that help you. Nothing here is a test of character.</p>
      </section>

      {routines.length === 0 ? (
        <section className="plan-empty">
          <span className="plan-empty-mark">◦</span>
          <h2>No routines yet.</h2>
          <p>This space will hold the small things you want to remember.</p>
        </section>
      ) : (
        <section className="plan-list">
          {routines.map((routine) => {
            const editing = editingRoutineId === routine.id;
            return (
              <article key={routine.id} className="plan-task routine-task">
                <div className="routine-task-main">
                  <span className={`plan-task-dot ${routine.status === 'Done' ? 'is-done' : ''}`} />
                  <div>
                    <strong>{routine.title}</strong>
                    <small>{routine.status === 'Pending' ? 'Not logged yet' : routine.status}</small>
                  </div>
                </div>
                <div className="routine-actions">
                  <button className="coach-button coach-button-primary" onClick={() => updateRoutineStatus(routine.id, 'Done')}>Done</button>
                  <button className="coach-button coach-button-secondary" onClick={() => {
                    setEditingRoutineId(editing ? null : routine.id);
                    setReasonDraft(routine.reason ?? '');
                  }}>Skip</button>
                </div>
                {editing && (
                  <div className="plan-task-detail">
                    <textarea
                      className="coach-textarea"
                      rows={2}
                      value={reasonDraft}
                      onChange={(event) => setReasonDraft(event.target.value)}
                      placeholder="Optional note"
                    />
                    <button className="coach-link-button" onClick={() => updateRoutineStatus(routine.id, 'Skipped', reasonDraft || 'Skipped')}>
                      Save note
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default RoutinesPage;
