'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useApp } from '@/contexts/AppContext';
import { DifficultyLevel } from '@/types';
import { getTodayString } from '@/lib/calculations';
import Toast from '@/components/Toast';

export default function AcademicsPage() {
  const { state, addDSAProblem, updateDSAProblem, deleteDSAProblem, addAIModule, updateAIModule } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // DSA form state
  const [showDSAForm, setShowDSAForm] = useState(false);
  const [dsaTitle, setDsaTitle] = useState('');
  const [dsaDifficulty, setDsaDifficulty] = useState<DifficultyLevel>('Medium');
  const [dsaTopic, setDsaTopic] = useState('');
  const [dsaLink, setDsaLink] = useState('');
  const [dsaNotes, setDsaNotes] = useState('');

  // AI form state
  const [showAIForm, setShowAIForm] = useState(false);
  const [aiName, setAiName] = useState('');
  const [aiCategory, setAiCategory] = useState('');
  const [aiProgress, setAiProgress] = useState(0);

  const handleDSASubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addDSAProblem({
      title: dsaTitle,
      difficulty: dsaDifficulty,
      topic: dsaTopic || 'General',
      link: dsaLink,
      solvedDate: getTodayString(),
      needsRevision: dsaDifficulty === 'Hard',
      notes: dsaNotes,
    });

    setToastMessage(`✓ ${dsaDifficulty} problem added!`);
    setShowToast(true);

    // Reset form
    setDsaTitle('');
    setDsaTopic('');
    setDsaLink('');
    setDsaNotes('');
    setShowDSAForm(false);
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addAIModule({
      name: aiName,
      category: aiCategory || 'General',
      progress: aiProgress,
      timeSpent: 0,
      completedDate: aiProgress === 100 ? getTodayString() : undefined,
      concepts: [],
      projects: [],
    });

    setToastMessage('✓ AI module added!');
    setShowToast(true);

    // Reset form
    setAiName('');
    setAiCategory('');
    setAiProgress(0);
    setShowAIForm(false);
  };

  const toggleRevision = (id: string, currentStatus: boolean) => {
    updateDSAProblem(id, { needsRevision: !currentStatus });
    setToastMessage(currentStatus ? 'Removed from revision list' : 'Added to revision list');
    setShowToast(true);
  };

  // Group DSA problems by topic
  const problemsByTopic = state.dsaProblems.reduce((acc, problem) => {
    const topic = problem.topic || 'General';
    if (!acc[topic]) acc[topic] = [];
    acc[topic].push(problem);
    return acc;
  }, {} as Record<string, typeof state.dsaProblems>);

  // Group AI modules by category
  const modulesByCategory = state.aiModules.reduce((acc, module) => {
    const category = module.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(module);
    return acc;
  }, {} as Record<string, typeof state.aiModules>);

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'Easy': return 'var(--color-complete)';
      case 'Medium': return 'var(--color-in-progress)';
      case 'Hard': return 'var(--color-missed)';
    }
  };

  return (
    <Navigation>
      <div className="academics-page">
        <h1>Academics - DSA & AI/ML</h1>
        <p className="subtitle">Track your learning progress and problem-solving journey</p>

        <div className="academics-grid">
          {/* DSA Section */}
          <section className="academics-section">
            <div className="section-header">
              <h2>💻 DSA & Coding</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowDSAForm(!showDSAForm)}
              >
                {showDSAForm ? 'Cancel' : '+ Add Problem'}
              </button>
            </div>

            {showDSAForm && (
              <form onSubmit={handleDSASubmit} className="add-form">
                <div className="form-group">
                  <label>Problem Title</label>
                  <input
                    type="text"
                    value={dsaTitle}
                    onChange={(e) => setDsaTitle(e.target.value)}
                    placeholder="e.g., Two Sum"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Difficulty</label>
                  <div className="difficulty-selector">
                    {(['Easy', 'Medium', 'Hard'] as DifficultyLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`difficulty-btn ${dsaDifficulty === level ? 'active' : ''}`}
                        style={{
                          borderColor: dsaDifficulty === level ? getDifficultyColor(level) : 'var(--border-color)',
                          backgroundColor: dsaDifficulty === level ? getDifficultyColor(level) : 'var(--bg-tertiary)',
                          color: dsaDifficulty === level ? 'white' : 'var(--text-primary)',
                        }}
                        onClick={() => setDsaDifficulty(level)}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Topic</label>
                  <input
                    type="text"
                    value={dsaTopic}
                    onChange={(e) => setDsaTopic(e.target.value)}
                    placeholder="e.g., Arrays, Hash Tables, Dynamic Programming"
                  />
                </div>

                <div className="form-group">
                  <label>Link (optional)</label>
                  <input
                    type="url"
                    value={dsaLink}
                    onChange={(e) => setDsaLink(e.target.value)}
                    placeholder="https://leetcode.com/..."
                  />
                </div>

                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    value={dsaNotes}
                    onChange={(e) => setDsaNotes(e.target.value)}
                    placeholder="Key insights, approach, time complexity..."
                    rows={3}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Add Problem
                </button>
              </form>
            )}

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{state.dsaProblems.length}</div>
                <div className="stat-label">Total Solved</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{state.dsaProblems.filter(p => p.difficulty === 'Easy').length}</div>
                <div className="stat-label">Easy</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{state.dsaProblems.filter(p => p.difficulty === 'Medium').length}</div>
                <div className="stat-label">Medium</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{state.dsaProblems.filter(p => p.difficulty === 'Hard').length}</div>
                <div className="stat-label">Hard</div>
              </div>
            </div>

            {Object.keys(problemsByTopic).length === 0 ? (
              <div className="empty-state">
                <p>No problems solved yet. Start tracking your progress!</p>
              </div>
            ) : (
              <div className="topics-list">
                {Object.entries(problemsByTopic).map(([topic, problems]) => (
                  <div key={topic} className="topic-group">
                    <h3 className="topic-title">
                      {topic} <span className="topic-count">({problems.length})</span>
                    </h3>
                    <div className="problems-list">
                      {problems.map((problem) => (
                        <div key={problem.id} className="problem-item">
                          <div className="problem-header">
                            <div className="problem-title">
                              {problem.link ? (
                                <a href={problem.link} target="_blank" rel="noopener noreferrer">
                                  {problem.title} ↗
                                </a>
                              ) : (
                                problem.title
                              )}
                            </div>
                            <div className="problem-actions">
                              <span
                                className="badge"
                                style={{ backgroundColor: getDifficultyColor(problem.difficulty), color: 'white' }}
                              >
                                {problem.difficulty}
                              </span>
                              <button
                                className={`revision-btn ${problem.needsRevision ? 'active' : ''}`}
                                onClick={() => toggleRevision(problem.id, problem.needsRevision)}
                                title={problem.needsRevision ? 'Remove from revision' : 'Mark for revision'}
                              >
                                📌
                              </button>
                            </div>
                          </div>
                          {problem.notes && (
                            <div className="problem-notes">{problem.notes}</div>
                          )}
                          <div className="problem-meta">
                            Solved on {new Date(problem.solvedDate).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* AI/ML Section */}
          <section className="academics-section">
            <div className="section-header">
              <h2>🤖 AI/ML Learning</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowAIForm(!showAIForm)}
              >
                {showAIForm ? 'Cancel' : '+ Add Module'}
              </button>
            </div>

            {showAIForm && (
              <form onSubmit={handleAISubmit} className="add-form">
                <div className="form-group">
                  <label>Module/Topic Name</label>
                  <input
                    type="text"
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="e.g., Neural Networks Basics"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={aiCategory} onChange={(e) => setAiCategory(e.target.value)}>
                    <option value="">Select category</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Deep Learning">Deep Learning</option>
                    <option value="NLP">NLP</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Reinforcement Learning">Reinforcement Learning</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Progress: {aiProgress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={aiProgress}
                    onChange={(e) => setAiProgress(parseInt(e.target.value))}
                    className="progress-slider"
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Add Module
                </button>
              </form>
            )}

            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-value">{state.aiModules.length}</div>
                <div className="stat-label">Total Modules</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{state.aiModules.filter(m => m.progress === 100).length}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{state.aiModules.filter(m => m.progress > 0 && m.progress < 100).length}</div>
                <div className="stat-label">In Progress</div>
              </div>
            </div>

            {Object.keys(modulesByCategory).length === 0 ? (
              <div className="empty-state">
                <p>No modules added yet. Start tracking your AI/ML learning!</p>
              </div>
            ) : (
              <div className="topics-list">
                {Object.entries(modulesByCategory).map(([category, modules]) => (
                  <div key={category} className="topic-group">
                    <h3 className="topic-title">
                      {category} <span className="topic-count">({modules.length})</span>
                    </h3>
                    <div className="modules-list">
                      {modules.map((module) => (
                        <div key={module.id} className="module-item">
                          <div className="module-header">
                            <div className="module-title">{module.name}</div>
                            <div className="module-progress-text">{module.progress}%</div>
                          </div>
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{
                                width: `${module.progress}%`,
                                backgroundColor: module.progress === 100 ? 'var(--color-complete)' : 'var(--accent-color)'
                              }}
                            />
                          </div>
                          {module.completedDate && (
                            <div className="module-meta">
                              Completed on {new Date(module.completedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type="success"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <style jsx>{`
        .academics-page {
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

        .academics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-xl);
        }

        .academics-section {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-lg);
        }

        .section-header h2 {
          font-size: var(--text-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }

        .add-form {
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

        .difficulty-selector {
          display: flex;
          gap: var(--spacing-sm);
        }

        .difficulty-btn {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .progress-slider {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-md);
          background: var(--bg-tertiary);
          outline: none;
          -webkit-appearance: none;
        }

        .progress-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent-color);
          cursor: pointer;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .stat-card {
          background-color: var(--bg-tertiary);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--accent-color);
        }

        .stat-label {
          font-size: var(--text-xs);
          color: var(--text-secondary);
          margin-top: var(--spacing-xs);
        }

        .empty-state {
          text-align: center;
          padding: var(--spacing-2xl);
          color: var(--text-secondary);
        }

        .topics-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .topic-group {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-lg);
          background-color: var(--bg-primary);
        }

        .topic-title {
          font-size: var(--text-lg);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }

        .topic-count {
          color: var(--text-tertiary);
          font-weight: 400;
          font-size: var(--text-sm);
        }

        .problems-list,
        .modules-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .problem-item,
        .module-item {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-md);
          transition: all var(--transition-fast);
        }

        .problem-item:hover,
        .module-item:hover {
          border-color: var(--accent-color);
          transform: translateX(2px);
        }

        .problem-header,
        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }

        .problem-title,
        .module-title {
          font-size: var(--text-base);
          font-weight: 600;
          color: var(--text-primary);
        }

        .problem-title a {
          color: var(--accent-color);
          text-decoration: none;
        }

        .problem-title a:hover {
          text-decoration: underline;
        }

        .problem-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .revision-btn {
          font-size: var(--text-lg);
          opacity: 0.3;
          transition: opacity var(--transition-fast);
        }

        .revision-btn:hover,
        .revision-btn.active {
          opacity: 1;
        }

        .problem-notes {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-sm);
          padding: var(--spacing-sm);
          background-color: var(--bg-tertiary);
          border-radius: var(--radius-sm);
        }

        .problem-meta,
        .module-meta {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }

        .module-progress-text {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--accent-color);
        }

        @media (max-width: 1024px) {
          .academics-grid {
            grid-template-columns: 1fr;
          }

          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </Navigation>
  );
}
