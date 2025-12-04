import { useApp } from '../../context/AppContext';

const LevelCard = () => {
    const { user } = useApp();
    const xpProgress = user ? (user.xp % 500) / 500 * 100 : 0;

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-white">Level Progress</h3>
                    <p className="text-xs text-zinc-500">Keep pushing forward</p>
                </div>
                <div className="w-14 h-14 rounded-xl bg-[#111111] border border-[#1a1a1a] flex items-center justify-center">
                    <span className="text-xl font-bold font-mono text-white">{user?.level || 1}</span>
                </div>
            </div>

            <div className="xp-bar mb-3">
                <div className="xp-fill" style={{ width: `${xpProgress}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold font-mono text-violet-400">{user?.xp || 0} XP</span>
                <span className="text-zinc-500">{user?.xpToNextLevel || 500} to next level</span>
            </div>
        </div>
    );
};

export default LevelCard;
