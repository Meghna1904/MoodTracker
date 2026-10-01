import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoach } from '../context/CoachContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, routines, completionRate, streakDays, adjustMyDay, energy, mood, cycleDay } = useCoach();
  const taskCards = tasks
    .filter((task) => !task.completed)
    .slice()
    .sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime())
    .slice(0, 4);
  const today = new Date();
  const dateLabel = today.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dayDescription = energy <= 2 ? 'needs a little more room today.' : energy === 3 ? 'looks manageable today.' : 'has room for meaningful progress.';
  const insight = mood === 'Depleted' || mood === 'Reactive'
    ? 'Your energy is asking for a smaller first move.'
    : cycleDay > 20
      ? 'You usually have more energy earlier in this phase.'
      : 'You tend to do your clearest work before noon.';

  return (
    <div className="coach-page os-dashboard">
      <section className="os-day-intro">
        <p className="os-date">{dateLabel}</p>
        <h1>{greeting}, Meghna.</h1>
        <p className="os-day-summary">Your day {dayDescription}</p>
      </section>

      <section className="os-schedule-section">
        <div className="os-section-heading">
          <span>Today</span>
          <span>{taskCards.length} things · {tasks.filter((task) => !task.completed && task.movesUsed < task.moveLimit).length} flexible</span>
        </div>
        <div className="os-timeline">
          {taskCards.map((task) => (
            <article key={task.id} className="os-timeline-item">
              <time>{new Date(task.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              <div className="os-timeline-line"><span /></div>
              <button className="os-schedule-task" onClick={() => navigate('/tasks')}>
                <strong>{task.title}</strong>
                <span>{task.description || 'Flexible work'} · {task.priority.toLowerCase()}</span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="os-insight">
        <span className="os-insight-mark">◌</span>
        <div>
          <p className="os-eyebrow">Something I noticed</p>
          <p>{insight}</p>
        </div>
      </section>

      <section className="os-adjustment">
        <div>
          <p className="os-eyebrow">Life check-in</p>
          <h2>Give the day a little room.</h2>
          <p>You mentioned {mood.toLowerCase()} energy. Nothing will be cancelled.</p>
        </div>
        <div className="os-actions">
          <button className="os-button os-button-primary" onClick={() => adjustMyDay()}>Adjust my day <span>→</span></button>
          <button className="os-button" onClick={() => navigate('/mood-cycle')}>Keep my plan</button>
        </div>
      </section>

      <section className="os-footer-stats">
        <span>{completionRate}% complete</span>
        <span>{streakDays} day streak</span>
        <button onClick={() => navigate('/routines')}>{routines.filter((routine) => routine.status === 'Done').length} routines done →</button>
      </section>
    </div>
  );
};

export default Dashboard;
