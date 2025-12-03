'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import Navigation from '@/components/Navigation';
import MetricCard from '@/components/MetricCard';
import ProgressBar from '@/components/ProgressBar';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import QuickActionButton from '@/components/QuickActionButton';
import { calculateWeekNumber, calculateExpectedProgress, getTodayString } from '@/lib/calculations';

export default function Dashboard() {
  const { state } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Memoize metrics to prevent recalculation on time updates
  const metrics = useMemo(() => {
    const currentWeek = calculateWeekNumber(state.profile.startDate);
    const expectedProgress = calculateExpectedProgress(currentWeek);

    const today = getTodayString();
    const todayActivity = state.dailyActivities.find(a => a.date === today);
    const todayDSA = todayActivity?.dsaProblems || 0;
    const totalDSA = state.dsaProblems.length;

    const completedAIModules = state.aiModules.filter(m => m.progress === 100).length;
    const totalAIModules = state.aiModules.length;
    const aiProgress = totalAIModules > 0 ? (completedAIModules / totalAIModules) * 100 : 0;

    // Calculate gym consistency (this week)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];

    const gymThisWeek = state.gymSessions.filter(s =>
      s.date >= weekStart && !s.isRestDay
    ).length;

    const currentStreak = state.gamification.currentStreak;

    return {
      currentWeek,
      expectedProgress,
      todayDSA,
      totalDSA,
      completedAIModules,
      totalAIModules,
      aiProgress,
      gymThisWeek,
      currentStreak,
    };
  }, [state.profile.startDate, state.dailyActivities, state.dsaProblems, state.aiModules, state.gymSessions, state.gamification.currentStreak]);

  // Format greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Navigation>
      <div className="dashboard">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="greeting">
              {getGreeting()}, {state.profile.name}! 👋
            </h1>
            <p className="date-time">
              {formatDate()} • {formatTime()}
            </p>
          </div>
          <div className="level-badge" title="Earn XP by completing tasks: DSA problems, AI modules, gym sessions, and more!">
            <div className="level-number">Level {state.gamification.level}</div>
            <div className="xp-text">{state.gamification.totalXP} XP</div>
            <div className="xp-progress">
              <div className="xp-progress-bar" style={{ width: `${(state.gamification.totalXP % 500) / 5}%` }} />
            </div>
            <div className="xp-next">{500 - (state.gamification.totalXP % 500)} XP to Level {state.gamification.level + 1}</div>
          </div>
        </header>

        {/* Metric Cards */}
        <section className="metrics-grid">
          <MetricCard
            icon="💻"
            label="DSA Problems Solved"
            value={metrics.totalDSA}
            subtext={`${metrics.todayDSA} today • Goal: ${state.profile.dailyGoals.dsaProblems}/day`}
            progress={(metrics.todayDSA / state.profile.dailyGoals.dsaProblems) * 100}
            status={metrics.todayDSA >= state.profile.dailyGoals.dsaProblems ? 'complete' : 'in-progress'}
            navigateTo="/academics"
          />
          <MetricCard
            icon="🤖"
            label="AI/ML Progress"
            value={`${metrics.completedAIModules}/${metrics.totalAIModules}`}
            subtext="Modules Completed"
            progress={metrics.aiProgress}
            status={metrics.aiProgress > 0 ? 'in-progress' : 'upcoming'}
            navigateTo="/academics"
            showPercentage
          />
          <MetricCard
            icon="🏋️"
            label="Gym This Week"
            value={`${metrics.gymThisWeek}/7`}
            subtext={`Goal: ${state.profile.dailyGoals.gymDaysPerWeek} days/week`}
            progress={(metrics.gymThisWeek / state.profile.dailyGoals.gymDaysPerWeek) * 100}
            status={metrics.gymThisWeek >= state.profile.dailyGoals.gymDaysPerWeek ? 'complete' : 'in-progress'}
            navigateTo="/gym"
          />
          <MetricCard
            icon="🔥"
            label="Current Streak"
            value={`${metrics.currentStreak} days`}
            subtext={metrics.currentStreak > 0 ? "Keep it going!" : "Start your streak today!"}
            status={metrics.currentStreak > 0 ? 'complete' : 'missed'}
            navigateTo="/analytics"
          />
        </section>

        {/* Overall Progress */}
        <div className="overall-progress">
          <div className="progress-header-section">
            <div>
              <h2 className="section-title">Overall Progress</h2>
              <p className="section-subtitle">Track your 4-month journey to success</p>
            </div>
            <div className="progress-stats-inline">
              <span className="progress-percentage">{Math.round((metrics.currentWeek / 17) * 100)}% Complete</span>
            </div>
          </div>
          <ProgressBar
            current={metrics.currentWeek}
            expected={metrics.currentWeek}
            max={17}
            label=""
          />
        </div>

        {/* Quick Actions */}
        <section className="quick-actions">
          <h2 className="section-title">Quick Actions</h2>
          <p className="section-subtitle">Log your daily activities and earn XP!</p>
          <div className="actions-grid">
            <QuickActionButton
              icon="🏋️"
              label="Log Gym Session"
              type="gym"
            />
            <QuickActionButton
              icon="💻"
              label="Solved DSA Problem"
              type="dsa"
            />
            <QuickActionButton
              icon="🤖"
              label="Completed AI Module"
              type="ai"
            />
            <QuickActionButton
              icon="🎉"
              label="Log Personal Win"
              type="personal"
            />
          </div>
          <div className="xp-rewards">
            <span className="reward-item">💻 DSA: +10-50 XP</span>
            <span className="reward-item">🤖 AI Module: +30 XP</span>
            <span className="reward-item">🏋️ Gym: +20 XP</span>
            <span className="reward-item">💼 Job App: +15 XP</span>
          </div>
        </section>

        {/* Activity Heatmap with Legend */}
        <div className="heatmap-section">
          <div className="heatmap-header">
            <h2 className="section-title">Activity Heatmap</h2>
            <div className="heatmap-legend">
              <span className="legend-label">Less</span>
              <div className="legend-square" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
              <div className="legend-square" style={{ backgroundColor: '#86efac' }} />
              <div className="legend-square" style={{ backgroundColor: '#4ade80' }} />
              <div className="legend-square" style={{ backgroundColor: '#22c55e' }} />
              <div className="legend-square" style={{ backgroundColor: 'var(--color-complete)' }} />
              <span className="legend-label">More</span>
            </div>
          </div>
          <ActivityHeatmap
            activities={state.dailyActivities}
            startDate={state.profile.startDate}
          />
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-xl);
          flex-wrap: wrap;
          gap: var(--spacing-lg);
        }

        .greeting {
          font-size: var(--text-4xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .date-time {
          font-size: var(--text-lg);
          color: var(--text-secondary);
        }

        .level-badge {
          background: linear-gradient(135deg, var(--accent-color), var(--accent-light));
          color: white;
          padding: var(--spacing-lg) var(--spacing-xl);
          border-radius: var(--radius-xl);
          text-align: center;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          cursor: help;
          transition: transform var(--transition-base);
          min-width: 200px;
        }

        .level-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
        }

        .level-number {
          font-size: var(--text-2xl);
          font-weight: 700;
          line-height: 1;
        }

        .xp-text {
          font-size: var(--text-sm);
          opacity: 0.9;
          margin-top: var(--spacing-xs);
        }

        .xp-progress {
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: var(--radius-full);
          margin-top: var(--spacing-sm);
          overflow: hidden;
        }

        .xp-progress-bar {
          height: 100%;
          background: white;
          border-radius: var(--radius-full);
          transition: width var(--transition-slow);
        }

        .xp-next {
          font-size: var(--text-xs);
          opacity: 0.8;
          margin-top: var(--spacing-xs);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-2xl);
        }

        .progress-section {
          margin-bottom: var(--spacing-2xl);
          background: var(--bg-secondary);
          padding: var(--spacing-xl);
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-color);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .progress-stats {
          display: flex;
          gap: var(--spacing-lg);
          align-items: center;
        }

        .week-indicator {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--accent-color);
        }

        .progress-percentage {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
        }

        .section-title {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .section-subtitle {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
          margin-bottom: var(--spacing-lg);
        }

        .quick-actions {
          margin: var(--spacing-2xl) 0;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-lg);
        }

        .xp-rewards {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          justify-content: center;
          padding: var(--spacing-md);
          background: var(--bg-secondary);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .reward-item {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          background: var(--bg-tertiary);
          padding: var(--spacing-xs) var(--spacing-md);
          border-radius: var(--radius-full);
          font-weight: 500;
        }

        .heatmap-section {
          margin-top: var(--spacing-2xl);
        }

        .heatmap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
          gap: var(--spacing-md);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .legend-label {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .legend-square {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          border: 1px solid var(--border-color);
        }

        @media (max-width: 1024px) {
          .actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .greeting {
            font-size: var(--text-2xl);
          }

          .date-time {
            font-size: var(--text-base);
          }

          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .progress-stats {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-xs);
          }

          .xp-rewards {
            flex-direction: column;
          }
        }
      `}</style>
    </Navigation>
  );
}
