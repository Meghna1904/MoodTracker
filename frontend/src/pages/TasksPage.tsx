import React, { useMemo, useState } from 'react';
import { useCoach } from '../context/CoachContext';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const TasksPage: React.FC = () => {
  const { tasks, moveHistory, moveTask, completeTask } = useCoach();
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const activeTasks = useMemo(
    () => tasks.slice().sort((left, right) => new Date(left.scheduledFor).getTime() - new Date(right.scheduledFor).getTime()),
    [tasks]
  );

  const totalMovesRemaining = activeTasks.reduce((sum, task) => sum + Math.max(0, task.moveLimit - task.movesUsed), 0);

  return (
    <div className="coach-page">
      <section className="coach-hero">
        <div>
          <p className="coach-kicker">One-time objectives</p>
          <h1 className="coach-title">Task Manager</h1>
          <p className="coach-copy">
            Flexible work with strict boundaries. Tasks can move, but never without a cost.
          </p>
        </div>

        <div className="coach-panel coach-panel-danger coach-metric-card">
          <span className="coach-label">Moves Remaining</span>
          <div className="coach-metric-row">
            <strong>{totalMovesRemaining}</strong>
            <span>Across active tasks</span>
          </div>
          <div className="coach-progress-track">
            <div className="coach-progress-fill is-danger" style={{ width: `${Math.min(100, totalMovesRemaining * 12)}%` }} />
          </div>
          <p className="coach-footnote">Drag and drop never bypasses deadline or conflict validation.</p>
        </div>
      </section>

      <section className="coach-grid coach-grid-tasks">
        <div className="coach-stack-lg">
          <div className="coach-section-header">
            <div>
              <p className="coach-label">Controlled flexibility</p>
              <h2>Active Tasks</h2>
            </div>
            <div className="coach-inline-badge coach-inline-badge-warn">3-move limit enforced</div>
          </div>

          <div className="coach-stack-md">
            {activeTasks.map((task) => {
              const movesRemaining = task.moveLimit - task.movesUsed;
              const isExpanded = expandedTaskId === task.id;
              const plusOneDay = new Date(task.scheduledFor);
              plusOneDay.setDate(plusOneDay.getDate() + 1);
              const plusTwoDays = new Date(task.scheduledFor);
              plusTwoDays.setDate(plusTwoDays.getDate() + 2);

              const options = [
                { label: 'Move by 1 day', value: plusOneDay.toISOString() },
                { label: 'Move by 2 days', value: plusTwoDays.toISOString() },
              ];

              return (
                <article
                  key={task.id}
                  className={`coach-panel coach-task-row ${movesRemaining === 0 ? 'is-locked' : ''}`}
                >
                  <div className="coach-task-main">
                    <button
                      className={`coach-task-check ${task.completed ? 'is-complete' : ''}`}
                      onClick={() => completeTask(task.id)}
                      aria-label={`Toggle ${task.title}`}
                    />
                    <div className="coach-stack-xs">
                      <div className="coach-task-heading">
                        <h3>{task.title}</h3>
                        <span className={`coach-chip ${task.priority === 'Urgent' ? 'is-danger' : ''}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="coach-copy-muted">{task.description}</p>
                      <div className="coach-meta-row">
                        <span>Scheduled: {formatDateTime(task.scheduledFor)}</span>
                        <span>Deadline: {formatDateTime(task.deadline)}</span>
                      </div>
                      <div className="coach-meta-row">
                        <span>{movesRemaining}/{task.moveLimit} moves left</span>
                        <span>{task.completed ? 'Completed' : 'Active'}</span>
                      </div>
                      <div className="coach-move-bar">
                        {Array.from({ length: task.moveLimit }).map((_, index) => (
                          <span
                            key={index}
                            className={`coach-move-segment ${index < task.movesUsed ? 'is-used' : ''}`}
                          />
                        ))}
                      </div>
                      {isExpanded && (
                        <div className="coach-inline-panel">
                          <p className="coach-label">Valid move options</p>
                          <div className="coach-inline-actions">
                            {options.map((option) => (
                              <button
                                key={option.label}
                                className="coach-button coach-button-secondary"
                                onClick={() => moveTask(task.id, option.value)}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="coach-task-actions">
                    <button
                      className="coach-button coach-button-secondary"
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    >
                      {isExpanded ? 'Hide detail' : 'Open detail'}
                    </button>
                    <button
                      className={`coach-button ${movesRemaining === 0 ? 'coach-button-muted' : 'coach-button-ghost'}`}
                      onClick={() => !isExpanded && setExpandedTaskId(task.id)}
                    >
                      Move task
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="coach-stack-lg">
          <div className="coach-panel">
            <div className="coach-section-header slim">
              <div>
                <p className="coach-label">Traceability</p>
                <h2>Moved Today</h2>
              </div>
            </div>

            <div className="coach-stack-sm">
              {moveHistory.slice(0, 5).map((entry) => (
                <div key={entry.id} className="coach-history-item">
                  <span className="coach-history-icon">R</span>
                  <div>
                    <strong>{entry.title}</strong>
                    <p>{formatDateTime(entry.to)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="coach-panel coach-panel-quote">
            <p className="coach-label">Strict Friend</p>
            <h3>Movement is not progress.</h3>
            <p className="coach-copy">
              Every move is a negotiation with your future self. The system allows flexibility, not avoidance.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default TasksPage;
