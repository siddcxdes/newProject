import { useApp } from '../../context/AppContext';

const ProgressTracker = () => {
    const { user } = useApp();

    if (!user) return null;

    const { currentWeek, totalWeeks, startDate } = user.journey;
    const progress = (currentWeek / totalWeeks) * 100;

    // Calculate expected progress based on time
    const start = new Date(startDate);
    const now = new Date();
    const totalDays = totalWeeks * 7;
    const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    const expectedProgress = Math.min(100, (daysPassed / totalDays) * 100);

    const isOnTrack = progress >= expectedProgress - 5; // 5% tolerance

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Journey Overview</h3>
                    <p className="text-sm text-slate-400">Track your 4-month journey to success</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isOnTrack
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                    {isOnTrack ? '✓' : '!'} {isOnTrack ? 'On Track' : 'Behind'}
                </div>
            </div>

            {/* Progress visualization */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Week {currentWeek} of {totalWeeks}</span>
                    <span className="text-white font-semibold">{Math.round(progress)}% Complete</span>
                </div>
                <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden relative">
                    {/* Expected progress marker */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                        style={{ left: `${expectedProgress}%` }}
                    ></div>
                    {/* Actual progress */}
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Start</span>
                    <span>Expected: {Math.round(expectedProgress)}%</span>
                    <span>Goal</span>
                </div>
            </div>

            {/* Week markers */}
            <div className="grid grid-cols-17 gap-1">
                {Array.from({ length: totalWeeks }, (_, i) => (
                    <div
                        key={i}
                        className={`h-2 rounded-sm transition-all ${i < currentWeek
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                                : i === currentWeek
                                    ? 'bg-purple-500/50 animate-pulse'
                                    : 'bg-slate-700/50'
                            }`}
                        title={`Week ${i + 1}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default ProgressTracker;
