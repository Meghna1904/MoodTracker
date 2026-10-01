import React from 'react';
import { useCoach } from '../context/CoachContext';

const AnalyticsPage: React.FC = () => {
  const { weeklyStats, peakPerformance, exportData, honestyRate, moveHistory, tasks } = useCoach();
  const lowMoodPerformance = Math.max(10, 100 - moveHistory.length * 8);
  const highMoodPerformance = Math.min(96, lowMoodPerformance + 38);
  const delayFrequency = tasks.length === 0 ? 0 : Math.round((moveHistory.length / tasks.length) * 20);

  return (
    <div className="coach-page">
      <section className="coach-hero">
        <div>
          <p className="coach-kicker">Accountability insights</p>
          <h1 className="coach-title">Are you being honest with yourself?</h1>
          <p className="coach-copy">
            Completion matters, but integrity matters more. These charts track where flexibility becomes avoidance.
          </p>
        </div>

        <div className="coach-panel coach-metric-card">
          <span className="coach-label">Peak performance</span>
          <div className="coach-metric-row">
            <strong>{peakPerformance}</strong>
            <span>Ante meridiem</span>
          </div>
          <p className="coach-footnote">
            Most high-impact work is completed before the world wakes up. Protect this window.
          </p>
        </div>
      </section>

      <section className="coach-grid coach-grid-analytics">
        <div className="coach-stack-lg">
          <div className="coach-panel">
            <div className="coach-section-header slim">
              <div>
                <p className="coach-label">Behavioral analysis</p>
                <h2>The Excuse Meter</h2>
              </div>
              <div className="coach-metric-compact">
                <strong>{delayFrequency}%</strong>
                <span>Friction rate</span>
              </div>
            </div>

            <div className="coach-excuse-chart">
              {weeklyStats.map((bar) => (
                <div key={bar.day} className="coach-bar-group">
                  <div className="coach-bar-stack">
                    <span className="coach-bar coach-bar-primary" style={{ height: `${bar.completion}%` }} />
                    <span className="coach-bar coach-bar-secondary" style={{ height: `${bar.adjustments}%` }} />
                  </div>
                  <span>{bar.day}</span>
                </div>
              ))}
            </div>

            <div className="coach-chart-legend">
              <div><span className="coach-legend-chip is-primary" /> Actual completion</div>
              <div><span className="coach-legend-chip is-secondary" /> Context-based adjustments</div>
            </div>
          </div>

          <div className="coach-panel coach-panel-dark">
            <p className="coach-label">Correlation study</p>
            <h2>Mood Sync</h2>
            <div className="coach-stack-sm">
              <div>
                <div className="coach-stat-row">
                  <span>Low mood performance</span>
                  <strong>{lowMoodPerformance}%</strong>
                </div>
                <div className="coach-progress-track">
                  <div className="coach-progress-fill is-muted" style={{ width: `${lowMoodPerformance}%` }} />
                </div>
              </div>
              <div>
                <div className="coach-stat-row">
                  <span>High mood performance</span>
                  <strong>{highMoodPerformance}%</strong>
                </div>
                <div className="coach-progress-track">
                  <div className="coach-progress-fill" style={{ width: `${highMoodPerformance}%` }} />
                </div>
              </div>
            </div>
            <p className="coach-copy-muted">
              Your output drops sharply when the day is emotionally heavy. Use that information to plan, not to hide.
            </p>
          </div>
        </div>

        <aside className="coach-stack-lg">
          <div className="coach-panel coach-panel-accent">
            <p className="coach-label">Delay frequency</p>
            <strong>{delayFrequency}%</strong>
            <p>of tasks have been moved relative to the current active workload.</p>
          </div>

          <div className="coach-panel">
            <div className="coach-section-header slim">
              <div>
                <p className="coach-label">Coach action</p>
                <h2>Next move</h2>
              </div>
            </div>

            <div className="coach-stack-sm">
              <button className="coach-button coach-button-primary coach-button-full">
                Honesty rate: {honestyRate}%
              </button>
              <button className="coach-button coach-button-secondary coach-button-full" onClick={() => exportData()}>
                Export raw data
              </button>
            </div>
          </div>

          <div className="coach-panel">
            <p className="coach-label">Strict Friend</p>
            <h3>Structure creates freedom.</h3>
            <p className="coach-copy-muted">
              The point of analytics is not guilt. It is to remove the lies that let drift feel reasonable.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AnalyticsPage;
