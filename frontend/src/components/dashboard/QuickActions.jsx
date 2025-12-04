import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const quickActions = [
    {
        id: 'gym',
        icon: '🏋️',
        label: 'Log Gym Session',
        type: 'gym',
        xp: '+20 XP',
        color: 'from-green-500 to-emerald-500'
    },
    {
        id: 'dsa',
        icon: '💻',
        label: 'Solved DSA Problem',
        type: 'dsa',
        xp: '+10-50 XP',
        color: 'from-blue-500 to-cyan-500',
        hasDifficulty: true
    },
    {
        id: 'ai',
        icon: '🤖',
        label: 'Completed AI Module',
        type: 'ai',
        xp: '+30 XP',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'personal',
        icon: '🎉',
        label: 'Log Personal Win',
        type: 'personal',
        xp: '+10 XP',
        color: 'from-orange-500 to-red-500'
    }
];

const QuickActions = () => {
    const { logActivity } = useApp();
    const [activeAction, setActiveAction] = useState(null);
    const [showDifficultyModal, setShowDifficultyModal] = useState(false);
    const [isLogging, setIsLogging] = useState(false);

    const handleAction = async (action) => {
        if (action.hasDifficulty) {
            setActiveAction(action);
            setShowDifficultyModal(true);
            return;
        }

        setActiveAction(action);
        setIsLogging(true);
        try {
            await logActivity(action.type);
        } finally {
            setIsLogging(false);
            setTimeout(() => setActiveAction(null), 300);
        }
    };

    const handleDsaSubmit = async (difficulty) => {
        setShowDifficultyModal(false);
        setIsLogging(true);
        try {
            await logActivity('dsa', { difficulty });
        } finally {
            setIsLogging(false);
            setTimeout(() => setActiveAction(null), 300);
        }
    };

    return (
        <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => handleAction(action)}
                        disabled={isLogging}
                        className={`quick-action-btn ${activeAction?.id === action.id ? 'ring-2 ring-purple-500 scale-95' : ''
                            } ${isLogging ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl shadow-lg`}>
                            {action.icon}
                        </div>
                        <span className="text-sm font-medium text-white">{action.label}</span>
                        <span className="text-xs text-green-400">{action.xp}</span>
                    </button>
                ))}
            </div>

            {/* XP Reference */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-500 text-center">
                    💡 Click any action to instantly log and earn XP! Data saves automatically.
                </p>
            </div>

            {/* Difficulty Modal for DSA */}
            {showDifficultyModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-6 max-w-sm w-full mx-4 animate-bounce-slow">
                        <h4 className="text-lg font-semibold text-white mb-4">Select Difficulty</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: 'easy', label: 'Easy', xp: '+10 XP', color: 'bg-green-500' },
                                { value: 'medium', label: 'Medium', xp: '+25 XP', color: 'bg-yellow-500' },
                                { value: 'hard', label: 'Hard', xp: '+50 XP', color: 'bg-red-500' }
                            ].map((diff) => (
                                <button
                                    key={diff.value}
                                    onClick={() => handleDsaSubmit(diff.value)}
                                    className="glass-card-hover p-4 text-center hover:scale-105 transition-transform"
                                >
                                    <div className={`w-4 h-4 ${diff.color} rounded-full mx-auto mb-2`}></div>
                                    <p className="text-white font-medium">{diff.label}</p>
                                    <p className="text-xs text-green-400">{diff.xp}</p>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => {
                                setShowDifficultyModal(false);
                                setActiveAction(null);
                            }}
                            className="w-full mt-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuickActions;
