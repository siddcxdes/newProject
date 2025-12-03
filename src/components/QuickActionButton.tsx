'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { useApp } from '@/contexts/AppContext';
import { DifficultyLevel } from '@/types';
import { getTodayString } from '@/lib/calculations';
import Toast from './Toast';

interface QuickActionButtonProps {
    icon: string;
    label: string;
    type: 'gym' | 'dsa' | 'ai' | 'personal';
}

export default function QuickActionButton({ icon, label, type }: QuickActionButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { addGymSession, addDSAProblem, addAIModule, addSocialActivity } = useApp();

    // Form states
    const [gymTime, setGymTime] = useState('');
    const [gymType, setGymType] = useState('');
    const [gymFeeling, setGymFeeling] = useState<1 | 2 | 3 | 4 | 5>(3);

    const [dsaDifficulty, setDsaDifficulty] = useState<DifficultyLevel>('Medium');
    const [dsaTopic, setDsaTopic] = useState('');
    const [dsaTitle, setDsaTitle] = useState('');
    const [dsaLink, setDsaLink] = useState('');

    const [aiModule, setAiModule] = useState('');
    const [aiCategory, setAiCategory] = useState('');

    const [personalWin, setPersonalWin] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const today = getTodayString();

            switch (type) {
                case 'gym':
                    addGymSession({
                        date: today,
                        workoutType: gymType || 'General',
                        duration: parseInt(gymTime) || 60,
                        feeling: gymFeeling,
                        isRestDay: false,
                    });
                    setToastMessage('🏋️ Gym session logged!');
                    setGymTime('');
                    setGymType('');
                    setGymFeeling(3);
                    break;

                case 'dsa':
                    addDSAProblem({
                        title: dsaTitle || 'Problem',
                        difficulty: dsaDifficulty,
                        topic: dsaTopic || 'General',
                        link: dsaLink,
                        solvedDate: today,
                        needsRevision: dsaDifficulty === 'Hard',
                    });
                    setToastMessage(`💻 ${dsaDifficulty} problem solved! +${dsaDifficulty === 'Easy' ? 10 : dsaDifficulty === 'Medium' ? 25 : 50} XP`);
                    setDsaTitle('');
                    setDsaTopic('');
                    setDsaLink('');
                    break;

                case 'ai':
                    addAIModule({
                        name: aiModule || 'Module',
                        category: aiCategory || 'General',
                        progress: 100,
                        timeSpent: 0,
                        completedDate: today,
                        concepts: [],
                        projects: [],
                    });
                    setToastMessage('🤖 AI module completed! +30 XP');
                    setAiModule('');
                    setAiCategory('');
                    break;

                case 'personal':
                    addSocialActivity({
                        date: today,
                        type: 'Achievement',
                        description: personalWin,
                    });
                    setToastMessage('🎉 Personal win logged!');
                    setPersonalWin('');
                    break;
            }

            setShowToast(true);
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    const renderModalContent = () => {
        switch (type) {
            case 'gym':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Workout Type</label>
                            <input
                                type="text"
                                value={gymType}
                                onChange={(e) => setGymType(e.target.value)}
                                placeholder="e.g., Chest & Back"
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input
                                type="number"
                                value={gymTime}
                                onChange={(e) => setGymTime(e.target.value)}
                                placeholder="60"
                                min="1"
                            />
                        </div>
                        <div className="form-group">
                            <label>How did you feel? (1-5)</label>
                            <div className="feeling-selector">
                                {[1, 2, 3, 4, 5].map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        className={`feeling-btn ${gymFeeling === level ? 'active' : ''}`}
                                        onClick={() => setGymFeeling(level as 1 | 2 | 3 | 4 | 5)}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Log Session
                        </button>
                    </form>
                );

            case 'dsa':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Problem Title</label>
                            <input
                                type="text"
                                value={dsaTitle}
                                onChange={(e) => setDsaTitle(e.target.value)}
                                placeholder="e.g., Two Sum"
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
                                placeholder="e.g., Arrays, Hash Tables"
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
                        <button type="submit" className="btn btn-primary">
                            Log Problem
                        </button>
                    </form>
                );

            case 'ai':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Module/Topic Name</label>
                            <input
                                type="text"
                                value={aiModule}
                                onChange={(e) => setAiModule(e.target.value)}
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
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Log Module
                        </button>
                    </form>
                );

            case 'personal':
                return (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>What did you achieve today?</label>
                            <textarea
                                value={personalWin}
                                onChange={(e) => setPersonalWin(e.target.value)}
                                placeholder="Describe your achievement..."
                                rows={4}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">
                            Log Win
                        </button>
                    </form>
                );
        }
    };

    return (
        <>
            <button className="quick-action-btn" onClick={() => setIsModalOpen(true)}>
                <span className="action-icon">{icon}</span>
                <span className="action-label">{label}</span>
            </button>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={label}>
                {renderModalContent()}
            </Modal>

            <Toast
                message={toastMessage}
                type="success"
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />

            <style jsx>{`
        .quick-action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg);
          background-color: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
          min-height: 120px;
          flex: 1;
        }

        .quick-action-btn:hover {
          border-color: var(--accent-color);
          background-color: var(--bg-tertiary);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px var(--shadow);
        }

        .action-icon {
          font-size: var(--text-4xl);
        }

        .action-label {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          text-align: center;
        }

        .form-group {
          margin-bottom: var(--spacing-lg);
        }

        .form-group label {
          display: block;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-sm);
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
        }

        .feeling-selector,
        .difficulty-selector {
          display: flex;
          gap: var(--spacing-sm);
        }

        .feeling-btn,
        .difficulty-btn {
          flex: 1;
          padding: var(--spacing-sm) var(--spacing-md);
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 600;
          color: var(--text-primary);
          transition: all var(--transition-fast);
        }

        .feeling-btn:hover,
        .difficulty-btn:hover {
          border-color: var(--accent-color);
        }

        .feeling-btn.active,
        .difficulty-btn.active {
          background-color: var(--accent-color);
          border-color: var(--accent-color);
          color: white;
        }
      `}</style>
        </>
    );
}
