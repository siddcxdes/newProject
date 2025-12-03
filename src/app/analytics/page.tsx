'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import { useApp } from '@/contexts/AppContext';
import { calculateWeekNumber, getTodayString } from '@/lib/calculations';

export default function AnalyticsPage() {
  const { state } = useApp();

  const currentWeek = calculateWeekNumber(state.profile.startDate);

  // Get current week's data
  const getWeekDates = (weekOffset = 0) => {
    const dates = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek - (weekOffset * 7));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const thisWeekDates = getWeekDates(0);
  const lastWeekDates = getWeekDates(1);

  const getWeekStats = (dates: string[]) => {
    const activities = state.dailyActivities.filter(a => dates.includes(a.date));
    return {
      dsaProblems: activities.reduce((sum, a) => sum + a.dsaProblems, 0),
      aiModules: activities.reduce((sum, a) => sum + a.aiModules, 0),
      gymDays: activities.filter(a => a.gymSession).length,
      avgProductivity: activities.length > 0
        ? Math.round(activities.reduce((sum, a) => sum + a.productivityScore, 0) / activities.length)
        : 0,
    };
  };

  const thisWeek = getWeekStats(thisWeekDates);
  const lastWeek = getWeekStats(lastWeekDates);

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Get monthly data
  const getMonthActivities = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    return state.dailyActivities.filter(a => a.date >= firstDay);
  };

  const monthActivities = getMonthActivities();
  const monthlyProductivity = monthActivities.length > 0
    ? Math.round(monthActivities.reduce((sum, a) => sum + a.productivityScore, 0) / monthActivities.length)
    : 0;

  // Best/worst days
  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const dayStats = state.dailyActivities.reduce((acc, activity) => {
    const day = getDayOfWeek(activity.date);
    if (!acc[day]) acc[day] = { total: 0, count: 0 };
    acc[day].total += activity.productivityScore;
    acc[day].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const dayAverages = Object.entries(dayStats).map(([day, stats]) => ({
    day,
    average: Math.round(stats.total / stats.count),
  })).sort((a, b) => b.average - a.average);

  const bestDay = dayAverages[0];
  const worstDay = dayAverages[dayAverages.length - 1];

  // Category distribution
  const totalDSA = state.dsaProblems.length;
  const totalAI = state.aiModules.filter(m => m.progress === 100).length;
  const totalGym = state.gymSessions.filter(s => !s.isRestDay).length;
  const totalSocial = state.socialActivities.length;
  const totalJobs = state.jobApplications.length;

  const total = totalDSA + totalAI + totalGym + totalSocial + totalJobs;

  return (
    <Navigation>
      <div className="analytics-page">
        <h1>📈 Analytics & Insights</h1>
        <p className="subtitle">Track your progress and identify patterns</p>

        {/* Weekly Summary */}
        <section className="section-card">
          <h2>📊 Weekly Summary - Week {currentWeek}</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">DSA Problems</span>
                <span className={`stat-change ${getChange(thisWeek.dsaProblems, lastWeek.dsaProblems) >= 0 ? 'positive' : 'negative'}`}>
                  {getChange(thisWeek.dsaProblems, lastWeek.dsaProblems) >= 0 ? '↑' : '↓'}
                  {Math.abs(getChange(thisWeek.dsaProblems, lastWeek.dsaProblems))}%
                </span>
              </div>
              <div className="stat-value">{thisWeek.dsaProblems}</div>
              <div className="stat-subtext">Last week: {lastWeek.dsaProblems}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">AI Modules</span>
                <span className={`stat-change ${getChange(thisWeek.aiModules, lastWeek.aiModules) >= 0 ? 'positive' : 'negative'}`}>
                  {getChange(thisWeek.aiModules, lastWeek.aiModules) >= 0 ? '↑' : '↓'}
                  {Math.abs(getChange(thisWeek.aiModules, lastWeek.aiModules))}%
                </span>
              </div>
              <div className="stat-value">{thisWeek.aiModules}</div>
              <div className="stat-subtext">Last week: {lastWeek.aiModules}</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Gym Days</span>
                <span className={`stat-change ${getChange(thisWeek.gymDays, lastWeek.gymDays) >= 0 ? 'positive' : 'negative'}`}>
                  {getChange(thisWeek.gymDays, lastWeek.gymDays) >= 0 ? '↑' : '↓'}
                  {Math.abs(getChange(thisWeek.gymDays, lastWeek.gymDays))}%
                </span>
              </div>
              <div className="stat-value">{thisWeek.gymDays}/7</div>
              <div className="stat-subtext">Last week: {lastWeek.gymDays}/7</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">Avg Productivity</span>
                <span className={`stat-change ${getChange(thisWeek.avgProductivity, lastWeek.avgProductivity) >= 0 ? 'positive' : 'negative'}`}>
                  {getChange(thisWeek.avgProductivity, lastWeek.avgProductivity) >= 0 ? '↑' : '↓'}
                  {Math.abs(getChange(thisWeek.avgProductivity, lastWeek.avgProductivity))}%
                </span>
              </div>
              <div className="stat-value">{thisWeek.avgProductivity}/100</div>
              <div className="stat-subtext">Last week: {lastWeek.avgProductivity}/100</div>
            </div>
          </div>
        </section>

        {/* Monthly Trends */}
        <section className="section-card">
          <h2>📅 Monthly Overview</h2>

          <div className="monthly-stats">
            <div className="monthly-card">
              <div className="monthly-icon">📊</div>
              <div className="monthly-content">
                <div className="monthly-value">{monthlyProductivity}/100</div>
                <div className="monthly-label">Avg Productivity Score</div>
              </div>
            </div>

            <div className="monthly-card">
              <div className="monthly-icon">🔥</div>
              <div className="monthly-content">
                <div className="monthly-value">{state.gamification.longestStreak}</div>
                <div className="monthly-label">Longest Streak</div>
              </div>
            </div>

            <div className="monthly-card">
              <div className="monthly-icon">⭐</div>
              <div className="monthly-content">
                <div className="monthly-value">Level {state.gamification.level}</div>
                <div className="monthly-label">{state.gamification.totalXP} XP</div>
              </div>
            </div>

            <div className="monthly-card">
              <div className="monthly-icon">📈</div>
              <div className="monthly-content">
                <div className="monthly-value">{monthActivities.length}</div>
                <div className="monthly-label">Active Days</div>
              </div>
            </div>
          </div>
        </section>

        {/* Day Performance */}
        {dayAverages.length > 0 && (
          <section className="section-card">
            <h2>📆 Day of Week Performance</h2>

            <div className="day-performance">
              {dayAverages.map((day) => (
                <div key={day.day} className="day-bar">
                  <div className="day-name">{day.day}</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${day.average}%`,
                        backgroundColor: day.average > 70 ? 'var(--color-complete)' :
                          day.average > 40 ? 'var(--color-in-progress)' :
                            'var(--color-missed)'
                      }}
                    />
                  </div>
                  <div className="day-score">{day.average}</div>
                </div>
              ))}
            </div>

            {bestDay && worstDay && (
              <div className="day-insights">
                <div className="insight-card positive">
                  <span className="insight-icon">🌟</span>
                  <span>Best day: <strong>{bestDay.day}</strong> ({bestDay.average}/100)</span>
                </div>
                <div className="insight-card negative">
                  <span className="insight-icon">⚠️</span>
                  <span>Needs work: <strong>{worstDay.day}</strong> ({worstDay.average}/100)</span>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Category Distribution */}
        {total > 0 && (
          <section className="section-card">
            <h2>🎯 Activity Distribution</h2>

            <div className="distribution-chart">
              <div className="chart-bars">
                {totalDSA > 0 && (
                  <div className="chart-bar" style={{ width: `${(totalDSA / total) * 100}%`, backgroundColor: '#6366f1' }}>
                    <span className="bar-label">DSA ({totalDSA})</span>
                  </div>
                )}
                {totalAI > 0 && (
                  <div className="chart-bar" style={{ width: `${(totalAI / total) * 100}%`, backgroundColor: '#8b5cf6' }}>
                    <span className="bar-label">AI/ML ({totalAI})</span>
                  </div>
                )}
                {totalGym > 0 && (
                  <div className="chart-bar" style={{ width: `${(totalGym / total) * 100}%`, backgroundColor: '#10b981' }}>
                    <span className="bar-label">Gym ({totalGym})</span>
                  </div>
                )}
                {totalSocial > 0 && (
                  <div className="chart-bar" style={{ width: `${(totalSocial / total) * 100}%`, backgroundColor: '#f59e0b' }}>
                    <span className="bar-label">Social ({totalSocial})</span>
                  </div>
                )}
                {totalJobs > 0 && (
                  <div className="chart-bar" style={{ width: `${(totalJobs / total) * 100}%`, backgroundColor: '#ef4444' }}>
                    <span className="bar-label">Jobs ({totalJobs})</span>
                  </div>
                )}
              </div>

              <div className="distribution-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#6366f1' }} />
                  <span>DSA: {Math.round((totalDSA / total) * 100)}%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }} />
                  <span>AI/ML: {Math.round((totalAI / total) * 100)}%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#10b981' }} />
                  <span>Gym: {Math.round((totalGym / total) * 100)}%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#f59e0b' }} />
                  <span>Social: {Math.round((totalSocial / total) * 100)}%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: '#ef4444' }} />
                  <span>Jobs: {Math.round((totalJobs / total) * 100)}%</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Milestones */}
        <section className="section-card">
          <h2>🏆 Milestones</h2>

          <div className="milestones-grid">
            {state.dsaProblems.length >= 50 && (
              <div className="milestone-card achieved">
                <div className="milestone-icon">🎯</div>
                <div className="milestone-text">50 DSA Problems!</div>
              </div>
            )}
            {state.gamification.currentStreak >= 30 && (
              <div className="milestone-card achieved">
                <div className="milestone-icon">🔥</div>
                <div className="milestone-text">30-Day Streak!</div>
              </div>
            )}
            {state.gamification.level >= 10 && (
              <div className="milestone-card achieved">
                <div className="milestone-icon">⭐</div>
                <div className="milestone-text">Level 10 Reached!</div>
              </div>
            )}
            {state.gymSessions.filter(s => !s.isRestDay).length >= 50 && (
              <div className="milestone-card achieved">
                <div className="milestone-icon">💪</div>
                <div className="milestone-text">50 Workouts!</div>
              </div>
            )}

            {/* Upcoming milestones */}
            {state.dsaProblems.length < 100 && (
              <div className="milestone-card upcoming">
                <div className="milestone-icon">🎯</div>
                <div className="milestone-text">100 DSA Problems</div>
                <div className="milestone-progress">{state.dsaProblems.length}/100</div>
              </div>
            )}
            {state.gamification.currentStreak < 60 && (
              <div className="milestone-card upcoming">
                <div className="milestone-icon">🔥</div>
                <div className="milestone-text">60-Day Streak</div>
                <div className="milestone-progress">{state.gamification.currentStreak}/60</div>
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx>{`
        .analytics-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        h1 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .subtitle {
          font-size: var(--text-lg);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xl);
        }

        .section-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .section-card h2 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-lg);
        }

        .stat-card {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          font-weight: 600;
        }

        .stat-change {
          font-size: var(--text-xs);
          font-weight: 700;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
        }

        .stat-change.positive {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--color-complete);
        }

        .stat-change.negative {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--color-missed);
        }

        .stat-value {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .stat-subtext {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .monthly-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-lg);
        }

        .monthly-card {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          background-color: var(--bg-tertiary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
        }

        .monthly-icon {
          font-size: var(--text-4xl);
        }

        .monthly-value {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--text-primary);
        }

        .monthly-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .day-performance {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .day-bar {
          display: grid;
          grid-template-columns: 100px 1fr 60px;
          align-items: center;
          gap: var(--spacing-md);
        }

        .day-name {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .bar-container {
          background-color: var(--bg-tertiary);
          height: 32px;
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          transition: width var(--transition-slow);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: var(--spacing-sm);
        }

        .day-score {
          font-size: var(--text-sm);
          font-weight: 700;
          color: var(--text-primary);
          text-align: right;
        }

        .day-insights {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
          margin-top: var(--spacing-lg);
        }

        .insight-card {
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-sm);
        }

        .insight-card.positive {
          background-color: rgba(16, 185, 129, 0.1);
          border: 1px solid var(--color-complete);
          color: var(--color-complete);
        }

        .insight-card.negative {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid var(--color-missed);
          color: var(--color-missed);
        }

        .insight-icon {
          font-size: var(--text-xl);
        }

        .distribution-chart {
          margin-top: var(--spacing-lg);
        }

        .chart-bars {
          display: flex;
          height: 60px;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--spacing-lg);
        }

        .chart-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: var(--text-sm);
          font-weight: 600;
          transition: all var(--transition-base);
        }

        .chart-bar:hover {
          opacity: 0.8;
        }

        .bar-label {
          white-space: nowrap;
        }

        .distribution-legend {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-lg);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: var(--radius-sm);
        }

        .milestones-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-lg);
        }

        .milestone-card {
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-align: center;
          transition: all var(--transition-base);
        }

        .milestone-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px var(--shadow);
        }

        .milestone-card.achieved {
          border-color: var(--color-complete);
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), var(--bg-tertiary));
        }

        .milestone-card.upcoming {
          opacity: 0.6;
        }

        .milestone-icon {
          font-size: var(--text-4xl);
          margin-bottom: var(--spacing-sm);
        }

        .milestone-text {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .milestone-progress {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .stats-grid,
          .monthly-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .milestones-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid,
          .monthly-stats,
          .milestones-grid {
            grid-template-columns: 1fr;
          }

          .day-insights {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Navigation>
  );
}
