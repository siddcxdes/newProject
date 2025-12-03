'use client';

import Navigation from '@/components/Navigation';
import Toast from '@/components/Toast';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { state, updateProfile, updateSettings } = useApp();
  const [name, setName] = useState(state.profile.name);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Daily goals state
  const [dsaGoal, setDsaGoal] = useState(state.profile.dailyGoals.dsaProblems);
  const [aiGoal, setAiGoal] = useState(state.profile.dailyGoals.aiLearningHours);
  const [gymGoal, setGymGoal] = useState(state.profile.dailyGoals.gymDaysPerWeek);

  const handleSaveName = () => {
    updateProfile({ name });
    setToastMessage('✓ Name updated successfully!');
    setShowToast(true);
  };

  const handleSaveGoals = () => {
    updateProfile({
      dailyGoals: {
        dsaProblems: dsaGoal,
        aiLearningHours: aiGoal,
        gymDaysPerWeek: gymGoal,
      }
    });
    setToastMessage('✓ Daily goals updated successfully!');
    setShowToast(true);
  };

  const toggleTheme = () => {
    const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
    setToastMessage(`✓ Switched to ${newTheme} mode!`);
    setShowToast(true);
  };

  return (
    <Navigation>
      <div className="page-container">
        <h1>Settings</h1>

        <div className="settings-section">
          <h2>Profile</h2>
          <div className="form-group">
            <label>Your Name</label>
            <div className="input-group">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
              <button className="btn btn-primary" onClick={handleSaveName}>
                Save
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="form-group">
            <label>Theme</label>
            <button className="btn btn-secondary" onClick={toggleTheme}>
              {state.settings.theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2>Daily Goals</h2>
          <p className="section-description">
            Customize your daily and weekly targets to match your pace
          </p>
          <div className="goals-grid">
            <div className="goal-input-item">
              <label>DSA Problems per Day</label>
              <input
                type="number"
                min="1"
                max="10"
                value={dsaGoal}
                onChange={(e) => setDsaGoal(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="goal-input-item">
              <label>AI Learning Hours per Day</label>
              <input
                type="number"
                min="1"
                max="8"
                value={aiGoal}
                onChange={(e) => setAiGoal(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="goal-input-item">
              <label>Gym Days per Week</label>
              <input
                type="number"
                min="1"
                max="7"
                value={gymGoal}
                onChange={(e) => setGymGoal(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSaveGoals}>
            Save Goals
          </button>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <style jsx>{`
        .page-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        h1 {
          font-size: var(--text-3xl);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xl);
        }
        
        .settings-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          margin-bottom: var(--spacing-lg);
        }
        
        .settings-section h2 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-lg);
        }
        
        .form-group {
          margin-bottom: var(--spacing-lg);
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
        
        .input-group {
          display: flex;
          gap: var(--spacing-sm);
        }
        
        .input-group input {
          flex: 1;
        }
        
        .goals-grid {
          display: grid;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        
        .goal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-md);
        }
        
        .goal-item span {
          color: var(--text-secondary);
          font-size: var(--text-sm);
        }
        
        .goal-item strong {
          color: var(--text-primary);
          font-size: var(--text-lg);
        }

        .goal-input-item {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .goal-input-item label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
        }

        .goal-input-item input {
          width: 100%;
          padding: var(--spacing-md);
          font-size: var(--text-lg);
          font-weight: 600;
          text-align: center;
        }

        .section-description {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-lg);
        }
      `}</style>
    </Navigation>
  );
}
