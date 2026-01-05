import { Suspense, lazy } from 'react';
import { useApp } from '../context/AppContext';
import Greeting from '../components/dashboard/Greeting';
import MetricCard from '../components/dashboard/MetricCard';
import StreakCard from '../components/dashboard/StreakCard';
import LevelCard from '../components/dashboard/LevelCard';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';

// Lazy load animation component
const HeroScene3D = lazy(() => import('../components/dashboard/HeroScene3D'));

const Dashboard = () => {
    const { user, activities } = useApp();

    const stats = user?.stats || {};

    return (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
            <Greeting userName={user?.name} />

            {/* Top Row - Animation & Level (equal height) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Animation Card */}
                <div className="glass-card overflow-hidden h-[140px]">
                    <Suspense fallback={
                        <div className="h-full flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-violet-500/20 animate-pulse"></div>
                        </div>
                    }>
                        <HeroScene3D height={140} />
                    </Suspense>
                </div>

                {/* Level Card */}
                <LevelCard level={user?.level} xp={user?.xp} xpToNextLevel={user?.xpToNextLevel} />
            </div>

            {/* Bottom Row - Streak & 4 Metrics (equal height) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {/* Streak Card - Full height */}
                <StreakCard streak={user?.streak} />

                {/* 4 Metric Cards in 2x2 grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <MetricCard
                        label="DSA Solved"
                        value={stats.dsaProblemsToday || 0}
                        sublabel="today"
                        color="violet"
                    />
                    <MetricCard
                        label="AI Modules"
                        value={stats.aiModulesCompleted || 0}
                        sublabel="completed"
                        color="emerald"
                    />
                    <MetricCard
                        label="Gym Days"
                        value={stats.gymDaysThisWeek || 0}
                        sublabel="this week"
                        total={7}
                        color="amber"
                    />
                    <MetricCard
                        label="Applications"
                        value={stats.jobApplications || 0}
                        sublabel="sent"
                        color="blue"
                    />
                </div>
            </div>

            {/* Activity Heatmap */}
            <ActivityHeatmap activities={activities} />
        </div>
    );
};

export default Dashboard;
