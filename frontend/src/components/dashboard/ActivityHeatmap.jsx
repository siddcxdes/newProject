import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';

// IST helpers
const getISTDate = () => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    return new Date(utc + IST_OFFSET);
};

const getISTDateString = (date = new Date()) => {
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
    const istDate = new Date(utc + IST_OFFSET);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const ActivityHeatmap = () => {
    const { heatmapData } = useApp();
    const [hoveredDay, setHoveredDay] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const todayIST = getISTDateString();

    // Generate last 365 days using IST
    const days = useMemo(() => {
        const result = [];
        const istToday = getISTDate();

        for (let i = 364; i >= 0; i--) {
            const date = new Date(istToday);
            date.setDate(istToday.getDate() - i);
            const dateStr = getISTDateString(date);

            result.push({
                date: dateStr,
                dayOfWeek: date.getDay(),
                data: heatmapData[dateStr] || null,
                isToday: dateStr === todayIST
            });
        }

        return result;
    }, [heatmapData, todayIST]);

    // Group by weeks
    const weeks = useMemo(() => {
        const result = [];
        let currentWeek = [];

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

        if (currentWeek.length > 0) {
            result.push(currentWeek);
        }

        return result;
    }, [days]);

    const getIntensityClass = (data, isToday) => {
        if (isToday) return 'bg-gradient-to-br from-sky-400 to-cyan-500 ring-2 ring-sky-400/50 shadow-lg shadow-sky-500/30';
        if (!data) return 'heatmap-empty';
        const count = data.count;
        if (count >= 5) return 'bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20';
        if (count >= 4) return 'bg-gradient-to-br from-emerald-500 to-teal-500';
        if (count >= 3) return 'bg-gradient-to-br from-sky-500 to-sky-600';
        if (count >= 2) return 'bg-gradient-to-br from-sky-600 to-sky-700';
        if (count >= 1) return 'bg-sky-800/60';
        return 'heatmap-empty';
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthLabels = useMemo(() => {
        const labels = [];
        let lastMonth = -1;
        let lastWeekIndex = -10; // Ensure first month isn't blocked

        weeks.forEach((week, weekIndex) => {
            const firstValidDay = week.find(d => d !== null);
            if (firstValidDay) {
                const date = new Date(firstValidDay.date);
                const month = date.getMonth();

                // Only add if it's a new month AND it's at least 3 weeks since the last label
                // This prevents overlapping Jan/Feb at the start/end of the 365-day range
                if (month !== lastMonth && (weekIndex - lastWeekIndex) > 3) {
                    labels.push({ month: months[month], weekIndex });
                    lastMonth = month;
                    lastWeekIndex = weekIndex;
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

    const stats = useMemo(() => {
        const entries = Object.entries(heatmapData);
        const totalActivities = entries.reduce((sum, [, d]) => sum + d.count, 0);
        const totalXp = entries.reduce((sum, [, d]) => sum + d.totalXp, 0);
        const activeDays = entries.length;

        return { totalActivities, totalXp, activeDays };
    }, [heatmapData]);

    return (
        <div className="glass-card p-4 sm:p-5 relative overflow-hidden">
            {/* Decorative gradient background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 sm:mb-5 relative">
                <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 animate-pulse"></span>
                        Activity Heatmap
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Past 365 days in IST</p>
                </div>
                <div className="flex gap-4 sm:gap-8 text-right">
                    <div>
                        <p className="stat-value text-base sm:text-lg">{stats.totalActivities}</p>
                        <p className="stat-label text-[9px] sm:text-[10px]">Activities</p>
                    </div>
                    <div>
                        <p className="stat-value text-base sm:text-lg">{stats.activeDays}</p>
                        <p className="stat-label text-[9px] sm:text-[10px]">Active Days</p>
                    </div>
                    <div className="hidden sm:block">
                        <p className="stat-value text-lg text-sky-400">{stats.totalXp}</p>
                        <p className="stat-label text-[10px]">Total XP</p>
                    </div>
                </div>
            </div>

            {/* Scrollable heatmap container for mobile */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <div className="min-w-[700px] sm:min-w-0">
                    {/* Month labels - hidden on mobile */}
                    <div className="hidden sm:flex mb-1.5 ml-7 text-[10px] font-medium text-[var(--color-text-muted)] relative h-3">
                        {monthLabels.map((label, i) => (
                            <span
                                key={i}
                                className="absolute"
                                style={{ left: `${label.weekIndex * 13}px` }}
                            >
                                {label.month}
                            </span>
                        ))}
                    </div>

                    {/* Heatmap grid */}
                    <div className="flex gap-[3px]">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[3px] text-[10px] font-medium text-[var(--color-text-muted)] mr-1.5 flex-shrink-0">
                            <span className="h-2.5"></span>
                            <span className="h-2.5">M</span>
                            <span className="h-2.5"></span>
                            <span className="h-2.5">W</span>
                            <span className="h-2.5"></span>
                            <span className="h-2.5">F</span>
                            <span className="h-2.5"></span>
                        </div>

                        {/* Weeks */}
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-[3px] flex-shrink-0">
                                {week.map((day, dayIndex) => (
                                    <div
                                        key={dayIndex}
                                        className={`w-2.5 h-2.5 rounded-sm transition-all cursor-pointer ${day ? getIntensityClass(day.data, day.isToday) : 'bg-transparent'
                                            } ${day && !day.isToday ? 'hover:ring-1 hover:ring-zinc-500' : ''}`}
                                        onMouseEnter={(e) => handleMouseEnter(e, day)}
                                        onMouseLeave={() => setHoveredDay(null)}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 text-[11px] relative">
                <span className="text-[var(--color-text-muted)] font-medium">Today: <span className="text-sky-400 font-semibold">{todayIST}</span></span>
                <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-text-muted)]">Less</span>
                    <div className="flex gap-[3px]">
                        <div className="w-2.5 h-2.5 bg-elevated rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-sky-800/60 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-br from-sky-600 to-sky-700 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-br from-sky-500 to-sky-600 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-sm"></div>
                        <div className="w-2.5 h-2.5 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-sm shadow-sm shadow-emerald-400/30"></div>
                    </div>
                    <span className="text-[var(--color-text-muted)]">More</span>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredDay && (
                <div
                    className="fixed z-50 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg px-3 py-2.5 pointer-events-none transform -translate-x-1/2 -translate-y-full shadow-xl"
                    style={{
                        left: tooltipPos.x,
                        top: tooltipPos.y - 5
                    }}
                >
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{hoveredDay.date}</p>
                    {hoveredDay.isToday && <p className="text-xs font-medium text-sky-400">Today</p>}
                    {hoveredDay.data ? (
                        <>
                            <p className="text-xs text-emerald-400 font-medium">{hoveredDay.data.count} activities</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{hoveredDay.data.totalXp} XP earned</p>
                        </>
                    ) : (
                        <p className="text-xs text-[var(--color-text-muted)]">No activity</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityHeatmap;

