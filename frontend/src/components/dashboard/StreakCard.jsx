import { useApp } from '../../context/AppContext';

const StreakCard = () => {
    const { user } = useApp();

    if (!user) return null;

    const { current, longest } = user.streak;
    const isActive = current > 0;

    return (
        <div className="glass-card p-6 relative overflow-hidden group">
            {/* Background effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${isActive
                    ? 'from-orange-500/10 to-red-500/10'
                    : 'from-slate-500/5 to-slate-500/5'
                } transition-all duration-500`}></div>

            <div className="relative">
                {/* Icon & Title */}
                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${isActive
                            ? 'bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30 animate-pulse-slow'
                            : 'bg-slate-700/50'
                        }`}>
                        🔥
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Current Streak</h3>
                        <p className="text-sm text-slate-400">
                            {isActive ? 'Keep it going!' : 'Start your streak today!'}
                        </p>
                    </div>
                </div>

                {/* Streak Count */}
                <div className="text-center py-4">
                    <p className={`text-5xl font-bold ${isActive ? 'gradient-text' : 'text-slate-500'
                        }`}>
                        {current}
                    </p>
                    <p className="text-slate-400 mt-1">
                        {current === 1 ? 'day' : 'days'}
                    </p>
                </div>

                {/* Stats */}
                <div className="flex justify-between pt-4 border-t border-white/10 text-sm">
                    <div>
                        <p className="text-slate-500">Longest Streak</p>
                        <p className="text-white font-semibold">{longest} days</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500">Status</p>
                        <p className={`font-semibold ${isActive ? 'text-green-400' : 'text-slate-400'}`}>
                            {isActive ? '✓ Active' : '○ Inactive'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreakCard;
