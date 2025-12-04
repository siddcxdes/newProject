import { useState } from 'react';
import { useApp } from '../context/AppContext';

const activityTypes = [
    { type: 'dsa', icon: '💻', label: 'DSA Problem', xp: 'Variable' },
    { type: 'ai', icon: '🤖', label: 'AI/ML Module', xp: '+30 XP' },
    { type: 'gym', icon: '🏋️', label: 'Gym Session', xp: '+20 XP' },
    { type: 'job', icon: '💼', label: 'Job Application', xp: '+15 XP' },
    { type: 'personal', icon: '🎉', label: 'Personal Win', xp: '+10 XP' },
];

const CheckIn = () => {
    const { logActivity, activities } = useApp();
    const [selectedType, setSelectedType] = useState(null);
    const [difficulty, setDifficulty] = useState('medium');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Get today's activities
    const today = new Date().toISOString().split('T')[0];
    const todayActivities = activities.filter(a =>
        a.date && a.date.startsWith(today)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedType) return;

        setSubmitting(true);
        try {
            await logActivity(selectedType, {
                difficulty: selectedType === 'dsa' ? difficulty : undefined,
                notes: notes || undefined
            });
            setSelectedType(null);
            setNotes('');
            setDifficulty('medium');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">✅ Daily Check-In</h1>
                <p className="text-slate-400">Log your activities and earn XP!</p>
            </div>

            {/* Activity Selection */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">What did you accomplish?</h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {activityTypes.map((activity) => (
                        <button
                            key={activity.type}
                            onClick={() => setSelectedType(activity.type)}
                            className={`p-4 rounded-xl border-2 transition-all ${selectedType === activity.type
                                    ? 'border-purple-500 bg-purple-500/20 scale-105'
                                    : 'border-white/10 hover:border-white/30 bg-white/5'
                                }`}
                        >
                            <span className="text-3xl block mb-2">{activity.icon}</span>
                            <span className="text-sm text-white font-medium block">{activity.label}</span>
                            <span className="text-xs text-green-400">{activity.xp}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Details Form */}
            {selectedType && (
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Add Details</h3>

                    {/* Difficulty for DSA */}
                    {selectedType === 'dsa' && (
                        <div>
                            <label className="text-sm text-slate-400 mb-2 block">Difficulty Level</label>
                            <div className="flex gap-3">
                                {['easy', 'medium', 'hard'].map((d) => (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => setDifficulty(d)}
                                        className={`px-4 py-2 rounded-lg capitalize transition-all ${difficulty === d
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                            }`}
                                    >
                                        {d}
                                        <span className="text-xs block">
                                            {d === 'easy' ? '+10 XP' : d === 'medium' ? '+25 XP' : '+50 XP'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="text-sm text-slate-400 mb-2 block">Notes (optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="What did you work on?"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary flex-1"
                        >
                            {submitting ? 'Logging...' : 'Log Activity & Earn XP 🚀'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedType(null);
                                setNotes('');
                            }}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Today's Activities */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                    Today's Activities
                    <span className="text-sm text-slate-400 font-normal ml-2">
                        ({todayActivities.length} logged)
                    </span>
                </h3>

                {todayActivities.length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl mb-4 block">📝</span>
                        <p className="text-slate-500">
                            No activities logged today. Start your journey! 🚀
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayActivities.map((activity) => (
                            <div
                                key={activity._id}
                                className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {activityTypes.find(a => a.type === activity.type)?.icon || '📝'}
                                    </span>
                                    <div>
                                        <p className="text-white font-medium capitalize">
                                            {activity.type}
                                            {activity.details?.difficulty && (
                                                <span className="text-slate-400 text-sm ml-2">
                                                    ({activity.details.difficulty})
                                                </span>
                                            )}
                                        </p>
                                        {activity.details?.notes && (
                                            <p className="text-sm text-slate-400">{activity.details.notes}</p>
                                        )}
                                    </div>
                                </div>
                                <span className="text-green-400 font-semibold">+{activity.xpEarned} XP</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckIn;
