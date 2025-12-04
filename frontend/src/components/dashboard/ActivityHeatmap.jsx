import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';

const ActivityHeatmap = () => {
    const { heatmapData } = useApp();
    const [hoveredDay, setHoveredDay] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // Generate last 365 days
    const days = useMemo(() => {
        const result = [];
        const today = new Date();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            result.push({
                date: dateStr,
                dayOfWeek: date.getDay(),
                data: heatmapData[dateStr] || null
            });
        }

        return result;
    }, [heatmapData]);

    // Group by weeks
    const weeks = useMemo(() => {
        const result = [];
        let currentWeek = [];

        // Add empty cells for first week alignment
        const firstDayOfWeek = days[0]?.dayOfWeek || 0;
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentWeek.push(null);
        }

        days.forEach((day) => {
            currentWeek.push(day);
            if (day.dayOfWeek === 6) {
                result.push(currentWeek);
                currentWeek = [];
            }
        });

        // Add remaining days
        if (currentWeek.length > 0) {
            result.push(currentWeek);
        }

        return result;
    }, [days]);

    // Get intensity class based on activity count
    const getIntensityClass = (data) => {
        if (!data) return 'bg-slate-800/50';
        const count = data.count;
        if (count >= 5) return 'bg-green-400';
        if (count >= 4) return 'bg-green-500';
        if (count >= 3) return 'bg-green-600';
        if (count >= 2) return 'bg-green-700';
        if (count >= 1) return 'bg-green-800';
        return 'bg-slate-800/50';
    };

    // Month labels
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get month positions for labels
    const monthLabels = useMemo(() => {
        const labels = [];
        let lastMonth = -1;

        weeks.forEach((week, weekIndex) => {
            const firstValidDay = week.find(d => d !== null);
            if (firstValidDay) {
                const month = new Date(firstValidDay.date).getMonth();
                if (month !== lastMonth) {
                    labels.push({ month: months[month], weekIndex });
                    lastMonth = month;
                }
            }
        });

        return labels;
    }, [weeks]);

    const handleMouseEnter = (e, day) => {
        if (!day) return;
        const rect = e.target.getBoundingClientRect();
        setHoveredDay(day);
        setTooltipPos({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
        });
    };

    // Calculate stats
    const stats = useMemo(() => {
        const entries = Object.entries(heatmapData);
        const totalActivities = entries.reduce((sum, [, d]) => sum + d.count, 0);
        const totalXp = entries.reduce((sum, [, d]) => sum + d.totalXp, 0);
        const activeDays = entries.length;
        const currentStreak = (() => {
            let streak = 0;
            const today = new Date();
            for (let i = 0; i < 365; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                if (heatmapData[dateStr]) {
                    streak++;
                } else if (i > 0) {
                    break;
                }
            }
            return streak;
        })();

        return { totalActivities, totalXp, activeDays, currentStreak };
    }, [heatmapData]);

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white">Activity Heatmap</h3>
                    <p className="text-sm text-slate-400">Your activity over the past year</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="text-center">
                        <p className="text-xl font-bold text-green-400">{stats.totalActivities}</p>
                        <p className="text-slate-400">Activities</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-bold text-purple-400">{stats.activeDays}</p>
                        <p className="text-slate-400">Active Days</p>
                    </div>
                    <div className="text-center hidden sm:block">
                        <p className="text-xl font-bold text-orange-400">{stats.totalXp}</p>
                        <p className="text-slate-400">Total XP</p>
                    </div>
                </div>
            </div>

            {/* Month labels */}
            <div className="flex mb-1 ml-8 text-xs text-slate-500">
                {monthLabels.map((label, i) => (
                    <span
                        key={i}
                        className="absolute"
                        style={{ marginLeft: `${label.weekIndex * 14}px` }}
                    >
                        {label.month}
                    </span>
                ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-1 overflow-x-auto pb-2 mt-6">
                {/* Day labels */}
                <div className="flex flex-col gap-1 text-xs text-slate-500 mr-2 flex-shrink-0">
                    <span className="h-3"></span>
                    <span className="h-3">Mon</span>
                    <span className="h-3"></span>
                    <span className="h-3">Wed</span>
                    <span className="h-3"></span>
                    <span className="h-3">Fri</span>
                    <span className="h-3"></span>
                </div>

                {/* Weeks */}
                {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 flex-shrink-0">
                        {week.map((day, dayIndex) => (
                            <div
                                key={dayIndex}
                                className={`w-3 h-3 rounded-sm transition-all cursor-pointer ${day ? getIntensityClass(day.data) : 'bg-transparent'
                                    } ${day ? 'hover:ring-2 hover:ring-white/50' : ''}`}
                                onMouseEnter={(e) => handleMouseEnter(e, day)}
                                onMouseLeave={() => setHoveredDay(null)}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-400">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 bg-slate-800/50 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                </div>
                <span>More</span>
            </div>

            {/* Tooltip */}
            {hoveredDay && (
                <div
                    className="fixed z-50 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{
                        left: tooltipPos.x,
                        top: tooltipPos.y - 5
                    }}
                >
                    <p className="text-white font-medium">{hoveredDay.date}</p>
                    {hoveredDay.data ? (
                        <>
                            <p className="text-green-400">{hoveredDay.data.count} activities</p>
                            <p className="text-purple-400">{hoveredDay.data.totalXp} XP earned</p>
                        </>
                    ) : (
                        <p className="text-slate-400">No activity</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityHeatmap;
