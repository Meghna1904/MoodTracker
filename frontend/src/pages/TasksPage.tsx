import React, { useMemo, useState } from 'react';
import { useCoach } from '../context/CoachContext';

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

const TasksPage: React.FC = () => {
  const { tasks, moveTask, completeTask } = useCoach();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const today = new Date();
  const activeTasks = useMemo(
    () => tasks
      .filter((task) => !task.completed)
      .sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime()),
    [tasks],
  );
  const todayTasks = activeTasks.filter((task) => new Date(task.scheduledFor).toDateString() === today.toDateString());
  const upcomingTasks = activeTasks.filter((task) => new Date(task.scheduledFor).toDateString() !== today.toDateString());

  const renderTask = (task: typeof activeTasks[number]) => {
    const expanded = expandedTaskId === task.id;
    const nextSlot = new Date(task.scheduledFor);
    nextSlot.setDate(nextSlot.getDate() + 1);

    return (
      <article key={task.id} className={`plan-task ${expanded ? 'is-expanded' : ''}`}>
        <button className="plan-task-main" onClick={() => setExpandedTaskId(expanded ? null : task.id)}>
          <span className="plan-task-dot" />
          <span>
            <strong>{task.title}</strong>
            <small>{formatDay(task.scheduledFor)} · {formatTime(task.scheduledFor)}</small>
          </span>
        </button>
        {expanded && (
          <div className="plan-task-detail">
            <p>{task.description || 'No notes for this task.'}</p>
            <span>Deadline {formatDay(task.deadline)} at {formatTime(task.deadline)}</span>
            <div className="plan-task-actions">
              <button className="coach-button coach-button-primary" onClick={() => completeTask(task.id)}>Complete</button>
              {task.movesUsed < task.moveLimit && (
                <button className="coach-button coach-button-secondary" onClick={() => moveTask(task.id, nextSlot.toISOString())}>
                  Move to tomorrow
                </button>
              )}
            </div>
          </div>
        )}
      </article>
    );
  };

  return (
    <div className="coach-page plan-page">
      <section className="plan-intro">
        <p className="os-date">Your plan</p>
        <h1 className="coach-title">Make space for what matters.</h1>
        <p className="coach-copy">A simple list of what is ahead. Select something when you need the details.</p>
      </section>

      {activeTasks.length === 0 ? (
        <section className="plan-empty">
          <span className="plan-empty-mark">◦</span>
          <h2>Nothing planned yet.</h2>
          <p>Your plan is open. Tasks will appear here when you add them.</p>
        </section>
      ) : (
        <div className="plan-list">
          {todayTasks.length > 0 && (
            <section>
              <div className="plan-heading"><span>Today</span><span>{todayTasks.length}</span></div>
              {todayTasks.map(renderTask)}
            </section>
          )}
          {upcomingTasks.length > 0 && (
            <section>
              <div className="plan-heading"><span>Coming up</span><span>{upcomingTasks.length}</span></div>
              {upcomingTasks.map(renderTask)}
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
