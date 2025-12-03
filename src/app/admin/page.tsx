'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Toast from '@/components/Toast';
import { useApp } from '@/contexts/AppContext';

export default function AdminPage() {
    const { state, updateProfile, deleteDSAProblem, deleteAIModule, deleteGymSession, deletePersonalGoal, deleteBook } = useApp();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'dsa' | 'ai' | 'gym' | 'goals' | 'jobs' | 'data'>('overview');

    const handleDelete = (type: string, id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        switch (type) {
            case 'dsa':
                deleteDSAProblem(id);
                break;
            case 'ai':
                deleteAIModule(id);
                break;
            case 'gym':
                deleteGymSession(id);
                break;
            case 'goal':
                deletePersonalGoal(id);
                break;
            case 'book':
                deleteBook(id);
                break;
        }

        setToastMessage(`✓ Deleted successfully!`);
        setShowToast(true);
    };

    const exportData = () => {
        const dataStr = JSON.stringify(state, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ascension-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        setToastMessage('✓ Data exported successfully!');
        setShowToast(true);
    };

    const clearAllData = () => {
        if (!confirm('⚠️ This will delete ALL your data. Are you absolutely sure?')) return;
        if (!confirm('⚠️ FINAL WARNING: This cannot be undone!')) return;

        localStorage.clear();
        window.location.reload();
    };

    return (
        <Navigation>
            <div className="admin-container">
                <header className="admin-header">
                    <div>
                        <h1>⚙️ Admin Panel</h1>
                        <p className="subtitle">Manage all your data and settings</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={exportData}>
                            📥 Export Data
                        </button>
                        <button className="btn btn-danger" onClick={clearAllData}>
                            🗑️ Clear All Data
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'dsa' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dsa')}
                    >
                        💻 DSA ({state.dsaProblems.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ai')}
                    >
                        🤖 AI/ML ({state.aiModules.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'gym' ? 'active' : ''}`}
                        onClick={() => setActiveTab('gym')}
                    >
                        🏋️ Gym ({state.gymSessions.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'goals' ? 'active' : ''}`}
                        onClick={() => setActiveTab('goals')}
                    >
                        🎯 Goals ({state.personalGoals.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('jobs')}
                    >
                        💼 Jobs ({state.jobApplications.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'data' ? 'active' : ''}`}
                        onClick={() => setActiveTab('data')}
                    >
                        💾 Data
                    </button>
                </div>

                {/* Tab Content */}
                <div className="admin-content">
                    {activeTab === 'overview' && (
                        <div className="overview-grid">
                            <div className="stat-card">
                                <div className="stat-icon">💻</div>
                                <div className="stat-info">
                                    <div className="stat-value">{state.dsaProblems.length}</div>
                                    <div className="stat-label">DSA Problems</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🤖</div>
                                <div className="stat-info">
                                    <div className="stat-value">{state.aiModules.length}</div>
                                    <div className="stat-label">AI Modules</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🏋️</div>
                                <div className="stat-info">
                                    <div className="stat-value">{state.gymSessions.length}</div>
                                    <div className="stat-label">Gym Sessions</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">🎯</div>
                                <div className="stat-info">
                                    <div className="stat-value">{state.personalGoals.length}</div>
                                    <div className="stat-label">Personal Goals</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">💼</div>
                                <div className="stat-info">
                                    <div className="stat-value">{state.jobApplications.length}</div>
                                    <div className="stat-label">Job Applications</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">⭐</div>
                                <div className="stat-info">
                                    <div className="stat-value">{state.gamification.totalXP}</div>
                                    <div className="stat-label">Total XP</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'dsa' && (
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Difficulty</th>
                                        <th>Topic</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.dsaProblems.map(problem => (
                                        <tr key={problem.id}>
                                            <td>{problem.title}</td>
                                            <td>
                                                <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                                                    {problem.difficulty}
                                                </span>
                                            </td>
                                            <td>{problem.topic}</td>
                                            <td>{new Date(problem.solvedDate).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete('dsa', problem.id, problem.title)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {state.dsaProblems.length === 0 && (
                                <div className="empty-state">No DSA problems yet</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Module Name</th>
                                        <th>Category</th>
                                        <th>Progress</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.aiModules.map(module => (
                                        <tr key={module.id}>
                                            <td>{module.name}</td>
                                            <td>{module.category}</td>
                                            <td>
                                                <div className="progress-cell">
                                                    <div className="mini-progress-bar">
                                                        <div
                                                            className="mini-progress-fill"
                                                            style={{ width: `${module.progress}%` }}
                                                        />
                                                    </div>
                                                    <span>{module.progress}%</span>
                                                </div>
                                            </td>
                                            <td>{module.completedDate ? new Date(module.completedDate).toLocaleDateString() : 'In Progress'}</td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete('ai', module.id, module.name)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {state.aiModules.length === 0 && (
                                <div className="empty-state">No AI modules yet</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'gym' && (
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Duration</th>
                                        <th>Feeling</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.gymSessions.map(session => (
                                        <tr key={session.id}>
                                            <td>{new Date(session.date).toLocaleDateString()}</td>
                                            <td>{session.isRestDay ? '🛌 Rest Day' : 'Workout'}</td>
                                            <td>{session.duration ? `${session.duration} min` : '-'}</td>
                                            <td>{session.feeling ? '⭐'.repeat(session.feeling) : '-'}</td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete('gym', session.id, session.date)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {state.gymSessions.length === 0 && (
                                <div className="empty-state">No gym sessions yet</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'goals' && (
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Goal</th>
                                        <th>Progress</th>
                                        <th>Target Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.personalGoals.map(goal => (
                                        <tr key={goal.id}>
                                            <td>{goal.name}</td>
                                            <td>
                                                <div className="progress-cell">
                                                    <div className="mini-progress-bar">
                                                        <div
                                                            className="mini-progress-fill"
                                                            style={{ width: `${goal.progress}%` }}
                                                        />
                                                    </div>
                                                    <span>{goal.progress}%</span>
                                                </div>
                                            </td>
                                            <td>{new Date(goal.targetDate).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDelete('goal', goal.id, goal.name)}
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {state.personalGoals.length === 0 && (
                                <div className="empty-state">No personal goals yet</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'jobs' && (
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Applied Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.jobApplications.map(job => (
                                        <tr key={job.id}>
                                            <td>{job.company}</td>
                                            <td>{job.role}</td>
                                            <td>
                                                <span className={`status-badge status-${job.status.toLowerCase().replace(' ', '-')}`}>
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td>{new Date(job.applicationDate).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {state.jobApplications.length === 0 && (
                                <div className="empty-state">No job applications yet</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="data-management">
                            <div className="data-section">
                                <h3>📊 Data Statistics</h3>
                                <div className="data-stats">
                                    <div className="data-stat">
                                        <span>Total Activities:</span>
                                        <strong>{state.dailyActivities.length}</strong>
                                    </div>
                                    <div className="data-stat">
                                        <span>Check-ins:</span>
                                        <strong>{state.dailyCheckIns.length}</strong>
                                    </div>
                                    <div className="data-stat">
                                        <span>Books:</span>
                                        <strong>{state.books.length}</strong>
                                    </div>
                                    <div className="data-stat">
                                        <span>Social Activities:</span>
                                        <strong>{state.socialActivities.length}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="data-section">
                                <h3>💾 Data Management</h3>
                                <div className="data-actions">
                                    <button className="btn btn-primary" onClick={exportData}>
                                        📥 Export All Data (JSON)
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => {
                                        const csv = generateCSV();
                                        downloadCSV(csv);
                                    }}>
                                        📊 Export as CSV
                                    </button>
                                </div>
                            </div>

                            <div className="data-section danger-zone">
                                <h3>⚠️ Danger Zone</h3>
                                <p>These actions are irreversible. Please be careful.</p>
                                <button className="btn btn-danger" onClick={clearAllData}>
                                    🗑️ Clear All Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Toast
                message={toastMessage}
                type="success"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <style jsx>{`
                .admin-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--spacing-xl);
                    flex-wrap: wrap;
                    gap: var(--spacing-lg);
                }

                .admin-header h1 {
                    font-size: var(--text-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: var(--spacing-xs);
                }

                .subtitle {
                    font-size: var(--text-base);
                    color: var(--text-secondary);
                }

                .header-actions {
                    display: flex;
                    gap: var(--spacing-md);
                }

                .admin-tabs {
                    display: flex;
                    gap: var(--spacing-sm);
                    margin-bottom: var(--spacing-xl);
                    overflow-x: auto;
                    padding-bottom: var(--spacing-sm);
                }

                .tab {
                    padding: var(--spacing-md) var(--spacing-lg);
                    border-radius: var(--radius-lg);
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    color: var(--text-secondary);
                    font-weight: 600;
                    white-space: nowrap;
                    transition: all var(--transition-base);
                }

                .tab:hover {
                    background: var(--bg-tertiary);
                    border-color: var(--accent-color);
                }

                .tab.active {
                    background: var(--accent-gradient);
                    color: white;
                    border-color: transparent;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }

                .admin-content {
                    background: var(--bg-secondary);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-xl);
                    border: 1px solid var(--border-color);
                }

                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--spacing-lg);
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    padding: var(--spacing-xl);
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-lg);
                    border: 1px solid var(--border-color);
                    transition: all var(--transition-base);
                }

                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 16px var(--shadow-lg);
                }

                .stat-icon {
                    font-size: var(--text-4xl);
                }

                .stat-value {
                    font-size: var(--text-3xl);
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                }

                .data-table {
                    overflow-x: auto;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                thead {
                    background: var(--bg-tertiary);
                }

                th {
                    padding: var(--spacing-md);
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-primary);
                    border-bottom: 2px solid var(--border-color);
                }

                td {
                    padding: var(--spacing-md);
                    border-bottom: 1px solid var(--border-color);
                    color: var(--text-secondary);
                }

                tr:hover {
                    background: var(--bg-tertiary);
                }

                .btn-delete {
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--radius-md);
                    background: transparent;
                    border: 1px solid var(--color-missed);
                    color: var(--color-missed);
                    font-size: var(--text-sm);
                    transition: all var(--transition-fast);
                }

                .btn-delete:hover {
                    background: var(--color-missed);
                    color: white;
                }

                .badge-easy { background: var(--color-complete); color: white; }
                .badge-medium { background: var(--color-in-progress); color: white; }
                .badge-hard { background: var(--color-missed); color: white; }

                .progress-cell {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-sm);
                }

                .mini-progress-bar {
                    flex: 1;
                    height: 6px;
                    background: var(--bg-primary);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }

                .mini-progress-fill {
                    height: 100%;
                    background: var(--accent-gradient);
                    border-radius: var(--radius-full);
                }

                .status-badge {
                    padding: var(--spacing-xs) var(--spacing-sm);
                    border-radius: var(--radius-full);
                    font-size: var(--text-xs);
                    font-weight: 600;
                }

                .status-saved { background: #94a3b8; color: white; }
                .status-applied { background: #60a5fa; color: white; }
                .status-interview-scheduled { background: #fbbf24; color: white; }
                .status-offer { background: #10b981; color: white; }
                .status-rejected { background: #ef4444; color: white; }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-2xl);
                    color: var(--text-tertiary);
                    font-size: var(--text-lg);
                }

                .data-management {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-xl);
                }

                .data-section {
                    padding: var(--spacing-xl);
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-lg);
                }

                .data-section h3 {
                    font-size: var(--text-xl);
                    font-weight: 600;
                    margin-bottom: var(--spacing-lg);
                    color: var(--text-primary);
                }

                .data-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--spacing-md);
                }

                .data-stat {
                    display: flex;
                    justify-content: space-between;
                    padding: var(--spacing-md);
                    background: var(--bg-primary);
                    border-radius: var(--radius-md);
                }

                .data-actions {
                    display: flex;
                    gap: var(--spacing-md);
                    flex-wrap: wrap;
                }

                .danger-zone {
                    border: 2px solid var(--color-missed);
                }

                .danger-zone p {
                    color: var(--text-secondary);
                    margin-bottom: var(--spacing-md);
                }

                @media (max-width: 768px) {
                    .admin-header {
                        flex-direction: column;
                    }

                    .header-actions {
                        width: 100%;
                        flex-direction: column;
                    }

                    .overview-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </Navigation>
    );

    function generateCSV() {
        // Simple CSV generation for DSA problems
        let csv = 'Type,Title,Date,Details\n';
        state.dsaProblems.forEach(p => {
            csv += `DSA,"${p.title}",${p.solvedDate},"${p.difficulty} - ${p.topic}"\n`;
        });
        return csv;
    }

    function downloadCSV(csv: string) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ascension-data-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        setToastMessage('✓ CSV exported successfully!');
        setShowToast(true);
    }
}
