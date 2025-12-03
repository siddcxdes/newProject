'use client';

import React, { useState, useMemo, useCallback, useRef, memo } from 'react';
import { DailyActivity } from '@/types';

interface ActivityHeatmapProps {
    activities: DailyActivity[];
    startDate: string;
}

// Memoized tooltip component to prevent re-renders
const HeatmapTooltip = memo(({
    hoveredCell,
    tooltipPos
}: {
    hoveredCell: { date: string; activity: DailyActivity | null } | null;
    tooltipPos: { x: number; y: number };
}) => {
    if (!hoveredCell) return null;

    return (
        <div
            className="heatmap-tooltip"
            style={{
                left: tooltipPos.x + 10,
                top: tooltipPos.y + 10,
            }}
        >
            <div className="tooltip-date">
                {new Date(hoveredCell.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}
            </div>
            {hoveredCell.activity ? (
                <div className="tooltip-content">
                    <div>DSA: {hoveredCell.activity.dsaProblems}</div>
                    <div>AI: {hoveredCell.activity.aiModules}</div>
                    <div>Gym: {hoveredCell.activity.gymSession ? '✓' : '✗'}</div>
                    <div>Score: {hoveredCell.activity.productivityScore}</div>
                </div>
            ) : (
                <div className="tooltip-content">No activity</div>
            )}
        </div>
    );
});

HeatmapTooltip.displayName = 'HeatmapTooltip';

function ActivityHeatmap({ activities, startDate }: ActivityHeatmapProps) {
    const [hoveredCell, setHoveredCell] = useState<{ date: string; activity: DailyActivity | null } | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoize activity lookup map for O(1) access
    const activityMap = useMemo(() => {
        const map = new Map<string, DailyActivity>();
        activities.forEach(activity => {
            map.set(activity.date, activity);
        });
        return map;
    }, [activities]);

    // Memoize dates generation (only recalculate when startDate changes)
    const dates = useMemo(() => {
        const dateArray = [];
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
            dateArray.push(new Date(d).toISOString().split('T')[0]);
        }
        return dateArray;
    }, [startDate]);

    // Memoize color function
    const getColor = useCallback((score: number): string => {
        if (score === 0) return 'var(--bg-tertiary)';
        if (score < 25) return '#86efac';
        if (score < 50) return '#4ade80';
        if (score < 75) return '#22c55e';
        return 'var(--color-complete)';
    }, []);

    // Memoize weeks calculation
    const weeks = useMemo(() => {
        const weeksArray: string[][] = [];
        let currentWeek: string[] = [];

        dates.forEach((date, index) => {
            const dayOfWeek = new Date(date).getDay();

            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeksArray.push(currentWeek);
                currentWeek = [];
            }

            currentWeek.push(date);

            if (index === dates.length - 1) {
                weeksArray.push(currentWeek);
            }
        });

        return weeksArray;
    }, [dates]);

    // Memoize month labels
    const monthLabels = useMemo(() => {
        const labels: { month: string; weekIndex: number }[] = [];
        let lastMonth = -1;

        weeks.forEach((week, index) => {
            const firstDate = new Date(week[0]);
            const month = firstDate.getMonth();

            if (month !== lastMonth) {
                labels.push({
                    month: firstDate.toLocaleDateString('en-US', { month: 'short' }),
                    weekIndex: index,
                });
                lastMonth = month;
            }
        });

        return labels;
    }, [weeks]);

    // Throttled mouse enter with requestAnimationFrame
    const handleMouseEnter = useCallback((date: string, activity: DailyActivity | null, e: React.MouseEvent) => {
        // Cancel any pending animation frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        // Use requestAnimationFrame to batch updates
        rafRef.current = requestAnimationFrame(() => {
            setHoveredCell({ date, activity });
            setTooltipPos({ x: e.clientX, y: e.clientY });
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        // Cancel any pending animation frame
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        setHoveredCell(null);
    }, []);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="heatmap-container">
            <h3 className="heatmap-title">Activity Heatmap</h3>

            <div className="heatmap-wrapper">
                <div className="day-labels">
                    {dayLabels.map((day, index) => (
                        <div key={day} className="day-label" style={{ gridRow: index + 2 }}>
                            {day}
                        </div>
                    ))}
                </div>

                <div className="heatmap-grid-container">
                    <div className="month-labels">
                        {monthLabels.map(({ month, weekIndex }) => (
                            <div
                                key={`${month}-${weekIndex}`}
                                className="month-label"
                                style={{ gridColumn: weekIndex + 1 }}
                            >
                                {month}
                            </div>
                        ))}
                    </div>

                    <div className="heatmap-grid">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="week-column">
                                {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                                    const date = week.find(d => new Date(d).getDay() === dayIndex);
                                    const activity = date ? activityMap.get(date) || null : null;
                                    const score = activity?.productivityScore || 0;

                                    return (
                                        <div
                                            key={`${weekIndex}-${dayIndex}`}
                                            className="heatmap-cell"
                                            style={{ backgroundColor: date ? getColor(score) : 'transparent' }}
                                            onMouseEnter={(e) => {
                                                e.stopPropagation();
                                                if (date) handleMouseEnter(date, activity, e);
                                            }}
                                            onMouseLeave={(e) => {
                                                e.stopPropagation();
                                                handleMouseLeave();
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (date && activity) {
                                                    console.log('Clicked date:', date, 'Activity:', activity);
                                                }
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <HeatmapTooltip hoveredCell={hoveredCell} tooltipPos={tooltipPos} />

            <style jsx>{`
        .heatmap-container {
          margin: var(--spacing-xl) 0;
        }
        
        .heatmap-title {
          font-size: var(--text-xl);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
        }
        
        .heatmap-wrapper {
          display: flex;
          gap: var(--spacing-sm);
          overflow-x: auto;
          padding: var(--spacing-md);
          background-color: var(--bg-secondary);
          border-radius: var(--radius-lg);
        }
        
        .day-labels {
          display: grid;
          grid-template-rows: 20px repeat(7, 12px);
          gap: 3px;
          padding-top: 20px;
        }
        
        .day-label {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
          text-align: right;
          padding-right: var(--spacing-sm);
          line-height: 12px;
        }
        
        .heatmap-grid-container {
          flex: 1;
        }
        
        .month-labels {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: 15px;
          gap: 3px;
          margin-bottom: var(--spacing-xs);
          height: 20px;
        }
        
        .month-label {
          font-size: var(--text-xs);
          color: var(--text-tertiary);
        }
        
        .heatmap-grid {
          display: flex;
          gap: 3px;
        }
        
        .week-column {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        
        .heatmap-cell {
          width: 12px;
          height: 12px;
          border-radius: 2px;
          cursor: pointer;
          transition: transform var(--transition-fast);
          will-change: transform;
          position: relative;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .heatmap-cell:hover {
          transform: scale(1.3);
          border: 1px solid var(--text-primary);
          z-index: 100;
          position: relative;
          isolation: isolate;
        }
        
        .heatmap-tooltip {
          position: fixed;
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: var(--spacing-sm);
          box-shadow: 0 4px 6px var(--shadow);
          z-index: var(--z-dropdown);
          pointer-events: none;
          min-width: 150px;
          transform: translate3d(0, 0, 0);
          will-change: transform;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          contain: layout style paint;
        }
        
        .tooltip-date {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }
        
        .tooltip-content {
          font-size: var(--text-xs);
          color: var(--text-secondary);
        }
        
        .tooltip-content div {
          margin: 2px 0;
        }
      `}</style>
        </div>
    );
}

// Export memoized version to prevent parent re-renders
export default memo(ActivityHeatmap);
