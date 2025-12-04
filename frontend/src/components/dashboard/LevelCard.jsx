import { useApp } from '../../context/AppContext';

const LevelCard = () => {
    const { user } = useApp();
    const xpProgress = user ? (user.xp % 500) / 500 * 100 : 0;

    return (
        <div className="glass-card p-3 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">Level</h3>
                    <p className="text-[10px] sm:text-xs text-zinc-500 hidden sm:block">Keep pushing</p>
                </div>
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                    <span className="text-lg sm:text-xl font-bold font-mono text-white">{user?.level || 1}</span>
                </div>
            </div>

            <div className="h-1.5 sm:h-2 bg-[#1a1a1a] rounded-full overflow-hidden mb-2 sm:mb-3">
                <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }}></div>
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-sm">
                <span className="font-semibold font-mono text-violet-400">{user?.xp || 0} XP</span>
                <span className="text-zinc-600">{user?.xpToNextLevel || 500} to next</span>
            </div>
        </div>
    );
};

export default LevelCard;
