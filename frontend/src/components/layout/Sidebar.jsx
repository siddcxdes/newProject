import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useState } from 'react';

const Sidebar = () => {
    const { user } = useApp();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'grid' },
        { path: '/checkin', label: 'Daily Check-In', icon: 'check' },
        { path: '/academics', label: 'Academics', icon: 'book' },
        { path: '/gym', label: 'Gym & Health', icon: 'activity' },
        { path: '/jobs', label: 'Job Search', icon: 'briefcase' },
        { path: '/social', label: 'Goals', icon: 'target' },
        { path: '/analytics', label: 'Analytics', icon: 'chart' },
        { path: '/settings', label: 'Settings', icon: 'settings' },
        { path: '/admin', label: 'Admin', icon: 'terminal' },
    ];

    const getIcon = (name) => {
        const icons = {
            grid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
            check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
            book: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
            activity: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
            briefcase: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
            target: <><circle cx="12" cy="12" r="10" strokeWidth={1.5} /><circle cx="12" cy="12" r="6" strokeWidth={1.5} /><circle cx="12" cy="12" r="2" strokeWidth={1.5} /></>,
            chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
            settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
            terminal: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
        };
        return (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icons[name]}
            </svg>
        );
    };

    const xpProgress = user ? (user.xp / user.xpToNextLevel) * 100 : 0;

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-56 bg-black border-r border-[#141414] overflow-y-auto hidden md:block">
            <div className="p-4">
                {/* XP Progress */}
                <div className="mb-6 p-4 bg-[#0a0a0a] rounded-xl border border-[#141414]">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wide">Progress</span>
                        <span className="text-xs font-mono text-violet-400 font-semibold">{user?.xp || 0} XP</span>
                    </div>
                    <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full" style={{ width: `${Math.min(xpProgress, 100)}%` }}></div>
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-2">
                        <span className="text-zinc-400">{user?.xpToNextLevel || 500}</span> XP to Level {(user?.level || 1) + 1}
                    </p>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            {getIcon(item.icon)}
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-[#141414]">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-3">Quick Stats</p>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-600">Streak</span>
                            <span className="font-mono text-amber-400 font-semibold">{user?.streak?.current || 0}d</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-600">DSA Solved</span>
                            <span className="font-mono text-violet-400 font-semibold">{user?.stats?.dsaProblemsTotal || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-600">Gym Days</span>
                            <span className="font-mono text-emerald-400 font-semibold">{user?.stats?.gymDaysThisWeek || 0}/7</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

// Mobile Navigation Component
export const MobileNav = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Home', icon: 'grid' },
        { path: '/checkin', label: 'Check-In', icon: 'check' },
        { path: '/academics', label: 'Study', icon: 'book' },
        { path: '/gym', label: 'Gym', icon: 'activity' },
        { path: '/admin', label: 'Admin', icon: 'terminal' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#141414] md:hidden z-50">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center justify-center p-2 ${isActive ? 'text-white' : 'text-zinc-600'
                            }`
                        }
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            {item.icon === 'grid' && <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
                            {item.icon === 'check' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                            {item.icon === 'book' && <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
                            {item.icon === 'activity' && <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />}
                            {item.icon === 'terminal' && <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                        </svg>
                        <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default Sidebar;
