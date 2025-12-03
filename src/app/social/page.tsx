'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useApp } from '@/contexts/AppContext';
import { getTodayString, generateId, calculateWeekNumber } from '@/lib/calculations';
import Toast from '@/components/Toast';

export default function SocialPage() {
  const { state, addPersonalGoal, updatePersonalGoal, deletePersonalGoal, addBook, updateBook, addSocialActivity, addWeeklyReflection } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Goal form state
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalProgress, setGoalProgress] = useState(0);

  // Book form state
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');

  // Social activity form state
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [activityDesc, setActivityDesc] = useState('');

  // Weekly reflection form state
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [biggestWin, setBiggestWin] = useState('');
  const [biggestChallenge, setBiggestChallenge] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');

  const currentWeek = calculateWeekNumber(state.profile.startDate);
  const thisWeekReflection = state.weeklyReflections.find(r => r.weekNumber === currentWeek);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPersonalGoal({
      name: goalName,
      targetDate: goalTarget,
      progress: goalProgress,
      milestones: [],
    });
    setToastMessage('🎯 Goal added!');
    setShowToast(true);
    setGoalName('');
    setGoalTarget('');
    setGoalProgress(0);
    setShowGoalForm(false);
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBook({
      title: bookTitle,
      author: bookAuthor,
      status: 'To Read',
    });
    setToastMessage('📚 Book added to reading list!');
    setShowToast(true);
    setBookTitle('');
    setBookAuthor('');
    setShowBookForm(false);
  };

  const handleActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSocialActivity({
      date: getTodayString(),
      type: activityType,
      description: activityDesc,
    });
    setToastMessage('✨ Activity logged!');
    setShowToast(true);
    setActivityType('');
    setActivityDesc('');
    setShowActivityForm(false);
  };

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWeeklyReflection({
      weekNumber: currentWeek,
      startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0],
      biggestWin,
      biggestChallenge,
      lessonsLearned,
      nextWeekFocus,
    });
    setToastMessage('📝 Weekly reflection saved!');
    setShowToast(true);
    setBiggestWin('');
    setBiggestChallenge('');
    setLessonsLearned('');
    setNextWeekFocus('');
    setShowReflectionForm(false);
  };

  const updateGoalProgress = (goalId: string, newProgress: number) => {
    updatePersonalGoal(goalId, { progress: newProgress });
    setToastMessage('Progress updated!');
    setShowToast(true);
  };

  const updateBookStatus = (bookId: string, newStatus: 'To Read' | 'Reading' | 'Completed') => {
    const updates: any = { status: newStatus };
    if (newStatus === 'Reading' && !state.books.find(b => b.id === bookId)?.startDate) {
      updates.startDate = getTodayString();
    }
    if (newStatus === 'Completed') {
      updates.completedDate = getTodayString();
    }
    updateBook(bookId, updates);
    setToastMessage(`Book marked as ${newStatus}!`);
    setShowToast(true);
  };

  return (
    <Navigation>
      <div className="social-page">
        <h1>🎯 Social & Goals</h1>
        <p className="subtitle">Personal development and meaningful connections</p>

        <div className="social-grid">
          {/* Personal Goals Section */}
          <section className="section-card">
            <div className="section-header">
              <h2>Personal Goals</h2>
              <button className="btn btn-primary" onClick={() => setShowGoalForm(!showGoalForm)}>
                {showGoalForm ? 'Cancel' : '+ Add Goal'}
              </button>
            </div>

            {showGoalForm && (
              <form onSubmit={handleGoalSubmit} className="form-card">
                <div className="form-group">
                  <label>Goal Name</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g., Learn Spanish, Build a side project"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Initial Progress: {goalProgress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={goalProgress}
                    onChange={(e) => setGoalProgress(parseInt(e.target.value))}
                    className="progress-slider"
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Goal</button>
              </form>
            )}

            {state.personalGoals.length === 0 ? (
              <div className="empty-state">
                <p>No goals set yet. What do you want to achieve?</p>
              </div>
            ) : (
              <div className="goals-list">
                {state.personalGoals.map((goal) => (
                  <div key={goal.id} className="goal-item">
                    <div className="goal-header">
                      <h3>{goal.name}</h3>
                      <span className="goal-date">
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="goal-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${goal.progress}%`,
                            backgroundColor: goal.progress === 100 ? 'var(--color-complete)' : 'var(--accent-color)'
                          }}
                        />
                      </div>
                      <span className="progress-text">{goal.progress}%</span>
                    </div>
                    <div className="goal-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateGoalProgress(goal.id, Math.min(goal.progress + 10, 100))}
                      >
                        +10%
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => deletePersonalGoal(goal.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Reading List Section */}
          <section className="section-card">
            <div className="section-header">
              <h2>📚 Reading List</h2>
              <button className="btn btn-primary" onClick={() => setShowBookForm(!showBookForm)}>
                {showBookForm ? 'Cancel' : '+ Add Book'}
              </button>
            </div>

            {showBookForm && (
              <form onSubmit={handleBookSubmit} className="form-card">
                <div className="form-group">
                  <label>Book Title</label>
                  <input
                    type="text"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    placeholder="e.g., Atomic Habits"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    placeholder="e.g., James Clear"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Add Book</button>
              </form>
            )}

            {state.books.length === 0 ? (
              <div className="empty-state">
                <p>No books in your reading list yet.</p>
              </div>
            ) : (
              <div className="books-list">
                {state.books.map((book) => (
                  <div key={book.id} className="book-item">
                    <div className="book-content">
                      <h3>{book.title}</h3>
                      <p className="book-author">by {book.author}</p>
                      <div className="book-status">
                        <select
                          value={book.status}
                          onChange={(e) => updateBookStatus(book.id, e.target.value as any)}
                          className="status-select"
                        >
                          <option value="To Read">To Read</option>
                          <option value="Reading">Reading</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                      {book.completedDate && (
                        <p className="book-meta">
                          Completed: {new Date(book.completedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Social Activities Section */}
        <section className="section-card full-width">
          <div className="section-header">
            <h2>✨ Social Activities</h2>
            <button className="btn btn-primary" onClick={() => setShowActivityForm(!showActivityForm)}>
              {showActivityForm ? 'Cancel' : '+ Log Activity'}
            </button>
          </div>

          {showActivityForm && (
            <form onSubmit={handleActivitySubmit} className="form-card">
              <div className="form-row">
                <div className="form-group">
                  <label>Activity Type</label>
                  <input
                    type="text"
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    placeholder="e.g., Coffee with friend, Family dinner"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                    placeholder="Brief description..."
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Log Activity</button>
            </form>
          )}

          {state.socialActivities.length === 0 ? (
            <div className="empty-state">
              <p>No social activities logged yet. Remember to maintain connections!</p>
            </div>
          ) : (
            <div className="activities-list">
              {state.socialActivities
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10)
                .map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-date">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.type}</h4>
                      <p>{activity.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Weekly Reflection Section */}
        <section className="section-card full-width reflection-section">
          <div className="section-header">
            <h2>📝 Weekly Reflection - Week {currentWeek}</h2>
            {!thisWeekReflection && (
              <button className="btn btn-primary" onClick={() => setShowReflectionForm(!showReflectionForm)}>
                {showReflectionForm ? 'Cancel' : 'Write Reflection'}
              </button>
            )}
          </div>

          {showReflectionForm && !thisWeekReflection && (
            <form onSubmit={handleReflectionSubmit} className="reflection-form">
              <div className="form-group">
                <label>🏆 Biggest Win This Week</label>
                <textarea
                  value={biggestWin}
                  onChange={(e) => setBiggestWin(e.target.value)}
                  placeholder="What are you most proud of?"
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>⚠️ Biggest Challenge</label>
                <textarea
                  value={biggestChallenge}
                  onChange={(e) => setBiggestChallenge(e.target.value)}
                  placeholder="What was difficult?"
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>💡 Lessons Learned</label>
                <textarea
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  placeholder="What did you learn?"
                  rows={3}
                  required
                />
              </div>
              <div className="form-group">
                <label>🎯 Next Week's Focus</label>
                <textarea
                  value={nextWeekFocus}
                  onChange={(e) => setNextWeekFocus(e.target.value)}
                  placeholder="What will you focus on?"
                  rows={3}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Reflection</button>
            </form>
          )}

          {thisWeekReflection && (
            <div className="reflection-display">
              <div className="reflection-item">
                <h4>🏆 Biggest Win</h4>
                <p>{thisWeekReflection.biggestWin}</p>
              </div>
              <div className="reflection-item">
                <h4>⚠️ Biggest Challenge</h4>
                <p>{thisWeekReflection.biggestChallenge}</p>
              </div>
              <div className="reflection-item">
                <h4>💡 Lessons Learned</h4>
                <p>{thisWeekReflection.lessonsLearned}</p>
              </div>
              <div className="reflection-item">
                <h4>🎯 Next Week's Focus</h4>
                <p>{thisWeekReflection.nextWeekFocus}</p>
              </div>
            </div>
          )}

          {!thisWeekReflection && !showReflectionForm && (
            <div className="empty-state">
              <p>No reflection for this week yet. Take time to reflect on your progress!</p>
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
        .social-page {
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

        .social-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-xl);
          margin-bottom: var(--spacing-xl);
        }

        .section-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
        }

        .section-card.full-width {
          grid-column: 1 / -1;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-md);
          font-size: var(--text-sm);
          min-height: auto;
        }

        .form-card {
          background-color: var(--bg-tertiary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-lg);
        }

        .form-group {
          margin-bottom: var(--spacing-md);
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }

        .progress-slider {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-md);
          background: var(--bg-primary);
          outline: none;
          -webkit-appearance: none;
        }

        .progress-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent-color);
          cursor: pointer;
        }

        .goals-list,
        .books-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .goal-item,
        .book-item {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          transition: all var(--transition-fast);
        }

        .goal-item:hover,
        .book-item:hover {
          border-color: var(--accent-color);
          transform: translateX(2px);
        }

        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .goal-header h3 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .goal-date {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .goal-progress {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-sm);
        }

        .progress-bar {
          flex: 1;
        }

        .progress-text {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 40px;
        }

        .goal-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .book-content h3 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .book-author {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
        }

        .status-select {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: var(--text-sm);
        }

        .book-meta {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          margin-top: var(--spacing-xs);
        }

        .activities-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .activity-item {
          display: flex;
          gap: var(--spacing-lg);
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .activity-item:hover {
          border-color: var(--accent-color);
          transform: translateX(2px);
        }

        .activity-date {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-secondary);
          min-width: 60px;
        }

        .activity-content h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .activity-content p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }

        .reflection-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .reflection-display {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-lg);
        }

        .reflection-item {
          background-color: var(--bg-tertiary);
          padding: var(--spacing-lg);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--accent-color);
        }

        .reflection-item h4 {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .reflection-item p {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--text-secondary);
        }

        @media (max-width: 1024px) {
          .social-grid {
            grid-template-columns: 1fr;
          }

          .reflection-display {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Navigation>
  );
}
