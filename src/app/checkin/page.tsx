'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useApp } from '@/contexts/AppContext';
import { getTodayString, isEvening, generateId } from '@/lib/calculations';
import Toast from '@/components/Toast';

export default function CheckInPage() {
  const { state, addDailyCheckIn, updateDailyCheckIn } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Morning tasks state
  const [task1, setTask1] = useState('');
  const [task2, setTask2] = useState('');
  const [task3, setTask3] = useState('');

  // Evening review state
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatBlocked, setWhatBlocked] = useState('');
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [tomorrow1, setTomorrow1] = useState('');
  const [tomorrow2, setTomorrow2] = useState('');
  const [tomorrow3, setTomorrow3] = useState('');

  // Undo state
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastCompletedTask, setLastCompletedTask] = useState<{ checkInId: string; taskId: string } | null>(null);

  const today = getTodayString();
  const todayCheckIn = state.dailyCheckIns.find(c => c.date === today);

  useEffect(() => {
    // Load today's check-in if it exists
    if (todayCheckIn) {
      if (todayCheckIn.morningTasks.length > 0) {
        setTask1(todayCheckIn.morningTasks[0]?.task || '');
        setTask2(todayCheckIn.morningTasks[1]?.task || '');
        setTask3(todayCheckIn.morningTasks[2]?.task || '');
      }
      if (todayCheckIn.eveningReview) {
        setWhatWentWell(todayCheckIn.eveningReview.whatWentWell);
        setWhatBlocked(todayCheckIn.eveningReview.whatBlocked);
        setEnergyLevel(todayCheckIn.eveningReview.energyLevel);
        setTomorrow1(todayCheckIn.eveningReview.tomorrowPriorities[0] || '');
        setTomorrow2(todayCheckIn.eveningReview.tomorrowPriorities[1] || '');
        setTomorrow3(todayCheckIn.eveningReview.tomorrowPriorities[2] || '');
      }
    }
  }, [todayCheckIn]);

  const handleMorningSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tasks = [
      { id: generateId(), task: task1, completed: false },
      { id: generateId(), task: task2, completed: false },
      { id: generateId(), task: task3, completed: false },
    ].filter(t => t.task.trim() !== '');

    if (todayCheckIn) {
      updateDailyCheckIn(todayCheckIn.id, {
        morningTasks: tasks,
      });
    } else {
      addDailyCheckIn({
        date: today,
        morningTasks: tasks,
        productivityScore: 0,
      });
    }

    setToastMessage('✅ Morning priorities set!');
    setShowToast(true);
  };

  const handleTaskToggle = (taskId: string) => {
    if (!todayCheckIn) return;

    const updatedTasks = todayCheckIn.morningTasks.map(t => {
      if (t.id === taskId) {
        const newCompleted = !t.completed;
        if (newCompleted) {
          // Set undo timer
          if (undoTimer) clearTimeout(undoTimer);
          const timer = setTimeout(() => {
            setLastCompletedTask(null);
          }, 5000);
          setUndoTimer(timer);
          setLastCompletedTask({ checkInId: todayCheckIn.id, taskId });
        }
        return {
          ...t,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });

    updateDailyCheckIn(todayCheckIn.id, {
      morningTasks: updatedTasks,
    });

    setToastMessage(updatedTasks.find(t => t.id === taskId)?.completed ? '✓ Task completed!' : 'Task unmarked');
    setShowToast(true);
  };

  const handleUndo = () => {
    if (!lastCompletedTask) return;

    const checkIn = state.dailyCheckIns.find(c => c.id === lastCompletedTask.checkInId);
    if (!checkIn) return;

    const updatedTasks = checkIn.morningTasks.map(t => {
      if (t.id === lastCompletedTask.taskId) {
        return { ...t, completed: false, completedAt: undefined };
      }
      return t;
    });

    updateDailyCheckIn(checkIn.id, { morningTasks: updatedTasks });

    if (undoTimer) clearTimeout(undoTimer);
    setLastCompletedTask(null);
    setToastMessage('↩️ Undone!');
    setShowToast(true);
  };

  const handleEveningSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!todayCheckIn) return;

    updateDailyCheckIn(todayCheckIn.id, {
      eveningReview: {
        whatWentWell,
        whatBlocked,
        energyLevel,
        tomorrowPriorities: [tomorrow1, tomorrow2, tomorrow3].filter(t => t.trim() !== ''),
      },
    });

    setToastMessage('🌙 Evening review saved!');
    setShowToast(true);
  };

  const completedCount = todayCheckIn?.morningTasks.filter(t => t.completed).length || 0;
  const totalCount = todayCheckIn?.morningTasks.length || 0;

  return (
    <Navigation>
      <div className="checkin-page">
        <h1>Daily Check-In</h1>
        <p className="subtitle">Set your priorities and reflect on your progress</p>

        {/* Morning Check-In */}
        <section className="checkin-section">
          <div className="section-header">
            <h2>🌅 Morning Check-In</h2>
            <p>What are your top 3 priorities for today?</p>
          </div>

          {todayCheckIn && todayCheckIn.morningTasks.length > 0 ? (
            <div className="tasks-list">
              <div className="progress-header">
                <span className="progress-text">
                  {completedCount} of {totalCount} completed
                </span>
                {lastCompletedTask && (
                  <button className="btn btn-secondary" onClick={handleUndo}>
                    ↩️ Undo (5s)
                  </button>
                )}
              </div>

              {todayCheckIn.morningTasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-item ${task.completed ? 'completed' : ''}`}
                  onClick={() => handleTaskToggle(task.id)}
                >
                  <div className="task-checkbox">
                    {task.completed ? '✓' : '○'}
                  </div>
                  <div className="task-content">
                    <div className="task-text">{task.task}</div>
                    {task.completedAt && (
                      <div className="task-time">
                        Completed at {new Date(task.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button
                className="btn btn-secondary mt-3"
                onClick={() => {
                  setTask1(todayCheckIn.morningTasks[0]?.task || '');
                  setTask2(todayCheckIn.morningTasks[1]?.task || '');
                  setTask3(todayCheckIn.morningTasks[2]?.task || '');
                  if (todayCheckIn) {
                    updateDailyCheckIn(todayCheckIn.id, { morningTasks: [] });
                  }
                }}
              >
                Edit Priorities
              </button>
            </div>
          ) : (
            <form onSubmit={handleMorningSubmit} className="checkin-form">
              <div className="form-group">
                <label>Priority #1</label>
                <input
                  type="text"
                  value={task1}
                  onChange={(e) => setTask1(e.target.value)}
                  placeholder="Most important task today"
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority #2</label>
                <input
                  type="text"
                  value={task2}
                  onChange={(e) => setTask2(e.target.value)}
                  placeholder="Second priority"
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority #3</label>
                <input
                  type="text"
                  value={task3}
                  onChange={(e) => setTask3(e.target.value)}
                  placeholder="Third priority"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Set Today's Priorities
              </button>
            </form>
          )}
        </section>

        {/* Evening Review */}
        {isEvening() && (
          <section className="checkin-section">
            <div className="section-header">
              <h2>🌙 Evening Review</h2>
              <p>Reflect on today and plan for tomorrow</p>
            </div>

            <form onSubmit={handleEveningSubmit} className="checkin-form">
              <div className="form-group">
                <label>What went well today?</label>
                <textarea
                  value={whatWentWell}
                  onChange={(e) => setWhatWentWell(e.target.value)}
                  placeholder="Celebrate your wins..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>What blocked your progress?</label>
                <textarea
                  value={whatBlocked}
                  onChange={(e) => setWhatBlocked(e.target.value)}
                  placeholder="Identify challenges..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Energy Level (1-5)</label>
                <div className="energy-selector">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`energy-btn ${energyLevel === level ? 'active' : ''}`}
                      onClick={() => setEnergyLevel(level as 1 | 2 | 3 | 4 | 5)}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Tomorrow's Top 3 Priorities</label>
                <input
                  type="text"
                  value={tomorrow1}
                  onChange={(e) => setTomorrow1(e.target.value)}
                  placeholder="Priority #1"
                  className="mb-2"
                />
                <input
                  type="text"
                  value={tomorrow2}
                  onChange={(e) => setTomorrow2(e.target.value)}
                  placeholder="Priority #2"
                  className="mb-2"
                />
                <input
                  type="text"
                  value={tomorrow3}
                  onChange={(e) => setTomorrow3(e.target.value)}
                  placeholder="Priority #3"
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Save Evening Review
              </button>
            </form>
          </section>
        )}

        {!isEvening() && (
          <div className="evening-reminder card">
            <p>🌙 Evening review will be available after 8 PM</p>
          </div>
        )}
      </div>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <style jsx>{`
        .checkin-page {
          max-width: 800px;
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

        .checkin-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .section-header {
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .section-header p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .checkin-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }

        .progress-text {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-secondary);
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: 60px;
        }

        .task-item:hover {
          border-color: var(--accent-color);
          transform: translateX(4px);
        }

        .task-item.completed {
          background-color: var(--bg-primary);
          border-color: var(--color-complete);
        }

        .task-checkbox {
          font-size: var(--text-2xl);
          line-height: 1;
          color: var(--text-secondary);
          min-width: 32px;
          text-align: center;
        }

        .task-item.completed .task-checkbox {
          color: var(--color-complete);
        }

        .task-content {
          flex: 1;
        }

        .task-text {
          font-size: var(--text-base);
          color: var(--text-primary);
          font-weight: 500;
        }

        .task-item.completed .task-text {
          text-decoration: line-through;
          color: var(--text-secondary);
        }

        .task-time {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          margin-top: var(--spacing-xs);
        }

        .energy-selector {
          display: flex;
          gap: var(--spacing-sm);
        }

        .energy-btn {
          flex: 1;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: var(--text-lg);
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }

        .energy-btn:hover {
          border-color: var(--accent-color);
        }

        .energy-btn.active {
          background-color: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }

        .evening-reminder {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .evening-reminder p {
          font-size: var(--text-base);
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .energy-selector {
            flex-wrap: wrap;
          }

          .energy-btn {
            min-width: 60px;
          }
        }
      `}</style>
    </Navigation>
  );
}
