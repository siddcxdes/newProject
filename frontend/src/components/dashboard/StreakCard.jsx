import { useApp } from '../../context/AppContext';

const StreakCard = () => {
    const { user } = useApp();
    const streak = user?.streak || { current: 0, longest: 0 };

    return (
        <div className="glass-card p-3 sm:p-5">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">Streak</h3>
                    <p className="text-[10px] sm:text-xs text-zinc-500 hidden sm:block">Stay consistent</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">{streak.current}</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">days</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#1a1a1a]">
                <span className="text-[10px] sm:text-sm text-zinc-500">Best</span>
                <span className="font-semibold font-mono text-xs sm:text-sm text-amber-400">{streak.longest} days</span>
            </div>
        </div>
    );
};

export default StreakCard;
