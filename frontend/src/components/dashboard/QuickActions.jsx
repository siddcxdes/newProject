import { useApp } from '../../context/AppContext';

const QuickActions = () => {
    const { logActivity, showNotification } = useApp();

    const handleAction = async (type, difficulty = null) => {
        try {
            await logActivity(type, difficulty ? { difficulty } : {});
        } catch (error) {
            showNotification('Failed to log activity', 'error');
        }
    };

    const actions = [
        {
            type: 'dsa',
            label: 'DSA Problem',
            sub: 'Log solved problem',
            difficulties: [
                { label: 'Easy', value: 'easy', xp: 10, color: 'emerald' },
                { label: 'Medium', value: 'medium', xp: 25, color: 'amber' },
                { label: 'Hard', value: 'hard', xp: 50, color: 'red' },
            ]
        },
        { type: 'ai', label: 'AI/ML Study', sub: 'Module completed', xp: 30 },
        { type: 'gym', label: 'Gym Session', sub: 'Workout logged', xp: 20 },
        { type: 'job', label: 'Job Applied', sub: 'Application sent', xp: 15 },
        { type: 'personal', label: 'Personal Win', sub: 'Achievement unlocked', xp: 10 },
    ];

    return (
        <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {actions.map((action) => (
                    <div key={action.type}>
                        {action.difficulties ? (
                            <div className="glass-card p-4 space-y-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">{action.label}</p>
                                    <p className="text-xs text-zinc-500">{action.sub}</p>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {action.difficulties.map((diff) => (
                                        <button
                                            key={diff.value}
                                            onClick={() => handleAction(action.type, diff.value)}
                                            className={`text-xs px-3 py-2 rounded-lg font-medium transition-all flex justify-between items-center ${diff.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' :
                                                    diff.color === 'amber' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' :
                                                        'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                }`}
                                        >
                                            <span>{diff.label}</span>
                                            <span className="font-mono">+{diff.xp}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleAction(action.type)}
                                className="w-full glass-card-hover p-4 text-left h-full"
                            >
                                <p className="text-sm font-semibold text-white mb-0.5">{action.label}</p>
                                <p className="text-xs text-zinc-500 mb-2">{action.sub}</p>
                                <p className="text-sm font-semibold font-mono text-emerald-400">+{action.xp} XP</p>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
