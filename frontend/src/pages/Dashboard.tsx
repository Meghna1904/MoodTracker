import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoach } from '../context/CoachContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, routines, adjustMyDay, energy, mood, cycleDay, completeTask } = useCoach();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const today = new Date();
  const taskCards = tasks
    .filter((task) => !task.completed && new Date(task.scheduledFor).toDateString() === today.toDateString())
    .slice()
    .sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime())
    .slice(0, 4);
  const dateLabel = today.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dayDescription = energy <= 2 ? 'needs a little more room today.' : 'looks manageable.';
  const insight = mood === 'Depleted' || mood === 'Reactive'
    ? 'You have a little less energy today.'
    : cycleDay > 20
      ? 'You tend to do difficult work earlier in this phase.'
      : 'You tend to do better with difficult tasks before noon.';
  const selectedTask = taskCards.find((task) => task.id === selectedTaskId);
  const flexibleCount = taskCards.filter((task) => task.movesUsed < task.moveLimit).length;
  const routineDone = routines.filter((routine) => routine.status === 'Done').length;

  return (
    <div className="coach-page os-dashboard">
      <section className="os-day-intro">
        <p className="os-date">{dateLabel}</p>
        <h1>{greeting}, Meghna.</h1>
        <p className="os-day-summary">Your day {dayDescription}</p>
      </section>

      <section className="os-schedule-section">
        <div className="os-section-heading">
          <span>Your day</span>
          <span>{taskCards.length} planned · {flexibleCount} flexible</span>
        </div>
        <div className="os-timeline">
          {taskCards.map((task) => (
            <article key={task.id} className={`os-timeline-item ${selectedTaskId === task.id ? 'is-selected' : ''}`}>
              <time>{new Date(task.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              <div className="os-timeline-line"><span /></div>
              <button className="os-schedule-task" onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}>
                <strong>{task.title}</strong>
                <span>{task.description || 'Flexible work'}</span>
              </button>
              {selectedTaskId === task.id && (
                <div className="os-task-detail">
                  <span>{new Date(task.scheduledFor).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {task.movesUsed < task.moveLimit ? 'Flexible' : 'Fixed'}</span>
                  <span>Deadline {new Date(task.deadline).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                  <div className="os-actions">
                    <button className="os-button os-button-primary" onClick={() => completeTask(task.id)}>Complete</button>
                    <button className="os-button" onClick={() => navigate('/tasks')}>Move</button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="os-context">
        <div>
          <p className="os-eyebrow">Something I noticed</p>
          <p>{insight}</p>
        </div>
        {(energy <= 2 || mood === 'Reactive' || mood === 'Depleted') && (
          <button className="os-button" onClick={() => adjustMyDay()}>Make today lighter</button>
        )}
      </section>

      {selectedTask && (
        <span className="sr-only">Viewing details for {selectedTask.title}</span>
      )}

      <section className="os-routines">
        <div>
          <p className="os-eyebrow">Small things</p>
          <p>{routineDone} of {routines.length} routines complete</p>
        </div>
        <button onClick={() => navigate('/routines')}>View routines <span>→</span></button>
      </section>
    </div>
  );
};

export default Dashboard;
