'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useApp } from '@/contexts/AppContext';
import { getTodayString } from '@/lib/calculations';
import Toast from '@/components/Toast';

export default function GymPage() {
  const { state, addGymSession } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('60');
  const [feeling, setFeeling] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isRestDay, setIsRestDay] = useState(false);
  const [notes, setNotes] = useState('');

  const today = getTodayString();
  const todaySession = state.gymSessions.find(s => s.date === today);

  // Get current week's sessions
  const getWeekDates = () => {
    const dates = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const weekSessions = state.gymSessions.filter(s => weekDates.includes(s.date));
  const activeDaysThisWeek = weekSessions.filter(s => !s.isRestDay).length;

  // Calculate monthly stats
  const getMonthSessions = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return state.gymSessions.filter(s => s.date >= firstDay && s.date <= lastDay && !s.isRestDay);
  };

  const monthSessions = getMonthSessions();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthlyConsistency = Math.round((monthSessions.length / daysInMonth) * 100);

  const handleQuickLog = (isRest: boolean) => {
    addGymSession({
      date: today,
      workoutType: isRest ? 'Rest Day' : 'Workout',
      duration: isRest ? 0 : 60,
      feeling: 3,
      isRestDay: isRest,
    });

    setToastMessage(isRest ? '😴 Rest day logged' : '🏋️ Workout logged! +20 XP');
    setShowToast(true);
  };

  const handleDetailedLog = (e: React.FormEvent) => {
    e.preventDefault();

    addGymSession({
      date: today,
      workoutType: workoutType || 'General Workout',
      duration: parseInt(duration),
      feeling,
      isRestDay,
      notes,
    });

    setToastMessage(isRestDay ? '😴 Rest day logged' : '🏋️ Workout logged! +20 XP');
    setShowToast(true);

    // Reset form
    setWorkoutType('');
    setDuration('60');
    setFeeling(3);
    setIsRestDay(false);
    setNotes('');
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const hasSession = (dateString: string) => {
    return state.gymSessions.find(s => s.date === dateString);
  };

  return (
    <Navigation>
      <div className="gym-page">
        <h1>🏋️ Gym & Health</h1>
        <p className="subtitle">Track your fitness journey and build consistency</p>

        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card highlight">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{state.gamification.currentStreak}</div>
              <div className="stat-label">Current Streak</div>
              <div className="stat-subtext">Longest: {state.gamification.longestStreak} days</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{activeDaysThisWeek}/7</div>
              <div className="stat-label">This Week</div>
              <div className="stat-subtext">Goal: {state.profile.dailyGoals.gymDaysPerWeek} days</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{monthlyConsistency}%</div>
              <div className="stat-label">Monthly Consistency</div>
              <div className="stat-subtext">{monthSessions.length} workouts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎖️</div>
            <div className="stat-content">
              <div className="stat-value">{state.gymStats.freezeTokens}</div>
              <div className="stat-label">Freeze Tokens</div>
              <div className="stat-subtext">Earn 1 per 7-day streak</div>
            </div>
          </div>
        </div>

        {/* Quick Log */}
        {!todaySession && (
          <div className="quick-log-section">
            <h2>Did you work out today?</h2>
            <div className="quick-buttons">
              <button
                className="btn btn-primary quick-yes"
                onClick={() => handleQuickLog(false)}
              >
                ✓ Yes, I worked out
              </button>
              <button
                className="btn btn-secondary quick-no"
                onClick={() => handleQuickLog(true)}
              >
                Rest Day
              </button>
            </div>
          </div>
        )}

        {todaySession && (
          <div className="today-logged">
            <div className="logged-icon">
              {todaySession.isRestDay ? '😴' : '✓'}
            </div>
            <div className="logged-content">
              <h3>{todaySession.isRestDay ? 'Rest Day Logged' : 'Workout Logged!'}</h3>
              <p>
                {!todaySession.isRestDay && (
                  <>
                    {todaySession.workoutType} • {todaySession.duration} min
                    {todaySession.notes && ` • ${todaySession.notes}`}
                  </>
                )}
                {todaySession.isRestDay && 'Recovery is important too!'}
              </p>
            </div>
          </div>
        )}

        {/* Weekly Calendar */}
        <section className="calendar-section">
          <h2>This Week</h2>
          <div className="week-calendar">
            {weekDates.map((date) => {
              const session = hasSession(date);
              const isToday = date === today;
              const isPast = new Date(date) < new Date(today);

              return (
                <div
                  key={date}
                  className={`calendar-day ${isToday ? 'today' : ''} ${session ? (session.isRestDay ? 'rest' : 'active') : isPast ? 'missed' : ''}`}
                >
                  <div className="day-name">{getDayName(date)}</div>
                  <div className="day-number">{getDayNumber(date)}</div>
                  <div className="day-status">
                    {session ? (session.isRestDay ? '😴' : '✓') : isPast ? '✗' : '○'}
                  </div>
                  {session && !session.isRestDay && (
                    <div className="day-details">
                      {session.workoutType}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed Log Form */}
        <section className="detailed-log-section">
          <h2>Log Detailed Workout</h2>
          <form onSubmit={handleDetailedLog} className="workout-form">
            <div className="form-row">
              <div className="form-group">
                <label>Workout Type</label>
                <input
                  type="text"
                  value={workoutType}
                  onChange={(e) => setWorkoutType(e.target.value)}
                  placeholder="e.g., Chest & Triceps, Cardio, Legs"
                />
              </div>

              <div className="form-group">
                <label>Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="300"
                />
              </div>
            </div>

            <div className="form-group">
              <label>How did you feel? (1-5)</label>
              <div className="feeling-selector">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`feeling-btn ${feeling === level ? 'active' : ''}`}
                    onClick={() => setFeeling(level as 1 | 2 | 3 | 4 | 5)}
                  >
                    <div className="feeling-emoji">
                      {level === 1 ? '😫' : level === 2 ? '😕' : level === 3 ? '😐' : level === 4 ? '😊' : '🔥'}
                    </div>
                    <div className="feeling-label">{level}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isRestDay}
                  onChange={(e) => setIsRestDay(e.target.checked)}
                />
                <span>This was a planned rest day</span>
              </label>
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it go? Any PRs or observations?"
                rows={3}
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Log Workout
            </button>
          </form>
        </section>

        {/* Recent Workouts */}
        <section className="recent-section">
          <h2>Recent Workouts</h2>
          {state.gymSessions.length === 0 ? (
            <div className="empty-state">
              <p>No workouts logged yet. Start your fitness journey today!</p>
            </div>
          ) : (
            <div className="workouts-list">
              {state.gymSessions
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((session) => (
                  <div key={session.id} className={`workout-item ${session.isRestDay ? 'rest-day' : ''}`}>
                    <div className="workout-date">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        weekday: 'short'
                      })}
                    </div>
                    <div className="workout-content">
                      <div className="workout-type">
                        {session.isRestDay ? '😴 ' : '🏋️ '}
                        {session.workoutType}
                      </div>
                      {!session.isRestDay && (
                        <div className="workout-meta">
                          {session.duration} min • Feeling: {session.feeling}/5
                        </div>
                      )}
                      {session.notes && (
                        <div className="workout-notes">{session.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <style jsx>{`
        .gym-page {
          max-width: 1200px;
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

        h2 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .stat-card {
          background-color: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          transition: all var(--transition-base);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px var(--shadow);
        }

        .stat-card.highlight {
          border-color: var(--accent-color);
          background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary));
        }

        .stat-icon {
          font-size: var(--text-4xl);
          line-height: 1;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }

        .stat-subtext {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          margin-top: var(--spacing-xs);
        }

        .quick-log-section {
          background-color: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .quick-buttons {
          display: flex;
          gap: var(--spacing-lg);
          justify-content: center;
          margin-top: var(--spacing-lg);
        }

        .quick-yes,
        .quick-no {
          min-width: 200px;
          font-size: var(--text-lg);
          padding: var(--spacing-lg) var(--spacing-xl);
        }

        .today-logged {
          background: linear-gradient(135deg, var(--color-complete), #059669);
          color: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-xl);
        }

        .logged-icon {
          font-size: var(--text-4xl);
          background: rgba(255, 255, 255, 0.2);
          width: 80px;
          height: 80px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logged-content h3 {
          font-size: var(--text-xl);
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }

        .logged-content p {
          opacity: 0.9;
        }

        .calendar-section,
        .detailed-log-section,
        .recent-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .week-calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--spacing-md);
        }

        .calendar-day {
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          text-align: center;
          transition: all var(--transition-fast);
        }

        .calendar-day.today {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .calendar-day.active {
          background-color: var(--color-complete);
          border-color: var(--color-complete);
          color: white;
        }

        .calendar-day.rest {
          background-color: var(--color-in-progress);
          border-color: var(--color-in-progress);
          color: white;
        }

        .calendar-day.missed {
          background-color: var(--bg-primary);
          opacity: 0.5;
        }

        .day-name {
          font-size: var(--text-xs);
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: var(--spacing-xs);
        }

        .day-number {
          font-size: var(--text-lg);
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
        }

        .day-status {
          font-size: var(--text-xl);
          margin-top: var(--spacing-xs);
        }

        .day-details {
          font-size: var(--text-xs);
          margin-top: var(--spacing-xs);
          opacity: 0.9;
        }

        .workout-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .form-group label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .checkbox-label {
          display: flex !important;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
        }

        .checkbox-label input {
          width: auto;
          margin: 0;
        }

        .feeling-selector {
          display: flex;
          gap: var(--spacing-sm);
        }

        .feeling-btn {
          flex: 1;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .feeling-btn:hover {
          border-color: var(--accent-color);
        }

        .feeling-btn.active {
          background-color: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }

        .feeling-emoji {
          font-size: var(--text-2xl);
        }

        .feeling-label {
          font-size: var(--text-sm);
          font-weight: 600;
        }

        .workouts-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .workout-item {
          display: flex;
          gap: var(--spacing-lg);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .workout-item:hover {
          border-color: var(--accent-color);
          transform: translateX(2px);
        }

        .workout-item.rest-day {
          opacity: 0.7;
        }

        .workout-date {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 80px;
        }

        .workout-content {
          flex: 1;
        }

        .workout-type {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .workout-meta {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .workout-notes {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          margin-top: var(--spacing-xs);
          font-style: italic;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .week-calendar {
            grid-template-columns: repeat(7, 1fr);
            gap: var(--spacing-xs);
          }

          .calendar-day {
            padding: var(--spacing-sm);
          }

          .day-details {
            display: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .quick-buttons {
            flex-direction: column;
          }

          .quick-yes,
          .quick-no {
            width: 100%;
          }
        }
      `}</style>
    </Navigation>
  );
}
