import { useApp } from '../../context/AppContext';

const StreakCard = () => {
    const { user } = useApp();
    const streak = user?.streak || { current: 0, longest: 0 };

    return (
        <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-white">Current Streak</h3>
                    <p className="text-xs text-zinc-500">Keep the momentum going</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold font-mono text-white">{streak.current}</p>
                    <p className="text-xs text-zinc-500 font-medium">days</p>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a]">
                <span className="text-sm text-zinc-500">Personal best</span>
                <span className="font-semibold font-mono text-amber-400">{streak.longest} days</span>
            </div>
        </div>
    );
};

export default StreakCard;
