import { useApp } from '../../context/AppContext';
import { getLevelProgress, formatXp, getXpForLevel } from '../../utils/xpCalculator';

const LevelCard = () => {
    const { user } = useApp();

    if (!user) return null;

    const progress = getLevelProgress(user.xp, user.level);
    const xpToNext = getXpForLevel(user.level + 1) - user.xp;

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>

            <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                            ⭐
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Level {user.level}</h3>
                            <p className="text-slate-400">Keep pushing forward!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold gradient-text">{formatXp(user.xp)}</p>
                        <p className="text-sm text-slate-400">Total XP</p>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress to Level {user.level + 1}</span>
                        <span className="text-white font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="xp-bar">
                        <div className="xp-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                        {formatXp(xpToNext)} XP to Level {user.level + 1}
                    </p>
                </div>

                {/* XP Reference */}
                <div className="mt-6 pt-4 border-t border-white/10">
                    <p className="text-xs text-slate-500 mb-2">XP REWARDS</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between text-slate-400">
                            <span>💻 DSA Problem</span>
                            <span className="text-green-400">+10-50 XP</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>🤖 AI Module</span>
                            <span className="text-green-400">+30 XP</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>🏋️ Gym Session</span>
                            <span className="text-green-400">+20 XP</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                            <span>💼 Job Application</span>
                            <span className="text-green-400">+15 XP</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelCard;
