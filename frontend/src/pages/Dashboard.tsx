import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoach } from '../context/CoachContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, routines, energy, mood, completeTask, updateRoutineStatus } = useCoach();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good night';
  const flowItems = [
    ...routines.map((routine) => ({
      id: routine.id,
      title: routine.title,
      complete: routine.status === 'Done',
      type: 'routine' as const,
    })),
    ...tasks
      .filter((task) => new Date(task.scheduledFor).toDateString() === new Date().toDateString())
      .map((task) => ({
        id: task.id,
        title: task.title,
        complete: task.completed,
        type: 'task' as const,
      })),
  ];
  const completed = flowItems.filter((item) => item.complete).length;
  const period = hour >= 19 || hour < 6 ? 'Night' : hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];

  return (
    <div className="flow-dashboard">
      <section className="flow-hero">
        <div>
          <p className="flow-kicker"><span /> TIME TO UNWIND</p>
          <h1>{greeting}, <em>Meghna.</em></h1>
          <p className="flow-subtitle">Here&apos;s a little space for what matters <strong>right now.</strong></p>
        </div>
        <div className="flow-sky">
          <span className="flow-moon">☾</span>
          <strong>{new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>
          <small>{period} · 7:00 PM — 6:30 AM</small>
        </div>
      </section>

      <div className="flow-layout">
        <main className="flow-main">
          <div className="flow-section-heading">
            <div>
              <p className="flow-kicker">YOUR FLOW</p>
              <h2>{period} things</h2>
            </div>
            <div className="flow-heading-actions">
              <button onClick={() => navigate('/routines')}>Edit routine</button>
              <span>{completed}/{flowItems.length || 0} done</span>
            </div>
          </div>

          {flowItems.length === 0 ? (
            <div className="flow-empty">
              <span>Nothing is asking for your attention.</span>
              <small>Add something when you are ready.</small>
            </div>
          ) : (
            <div className="flow-list">
              {flowItems.map((item, index) => (
                <div className={`flow-row ${item.complete ? 'is-complete' : ''}`} key={`${item.type}-${item.id}`}>
                  <button
                    className="flow-check"
                    onClick={() => item.type === 'task'
                      ? completeTask(item.id)
                      : updateRoutineStatus(item.id, item.complete ? 'Pending' : 'Done')}
                    aria-label={`Mark ${item.title} ${item.complete ? 'incomplete' : 'complete'}`}
                  />
                  <span className="flow-title">{item.title}</span>
                  <span className="flow-index">{String(index + 1).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          )}
          <button className="flow-add" onClick={() => navigate('/plan')}>⊕ &nbsp; Add something to your {period.toLowerCase()}</button>
        </main>

        <aside className="flow-overview">
          <div className="flow-overview-heading">
            <p className="flow-kicker">DAY OVERVIEW</p>
            <span>☰</span>
          </div>
          {periods.map((item) => (
            <div className={`flow-period ${item === period ? 'is-current' : ''}`} key={item}>
              <span className="flow-period-icon">{item === 'Night' ? '☾' : item === 'Morning' ? '◌' : item === 'Afternoon' ? '☼' : '✺'}</span>
              <div>
                <strong>{item}</strong>
                <small>{item === period ? `${completed}/${flowItems.length || 0} · now` : 'Open space'}</small>
              </div>
            </div>
          ))}
          <div className="flow-overview-footer">
            <p>Only your current moment stays in focus <span>✦</span></p>
            <button onClick={() => navigate('/history')}>Review my day <span>↗</span></button>
          </div>
        </aside>
      </div>

      <button className="flow-checkin" onClick={() => navigate('/mood-cycle')}><span>⊕</span> Add</button>
      <section className="flow-note">
        <p className="flow-kicker">LITTLE CHECK-IN</p>
        <p>{energy <= 2 ? 'Your energy is asking for a softer evening.' : mood === 'Reactive' ? 'You can let the day be quieter now.' : 'How are you feeling in this moment?'}</p>
      </section>
    </div>
  );
};

export default Dashboard;
