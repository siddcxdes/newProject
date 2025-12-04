import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/checkin', icon: '✅', label: 'Daily Check-In' },
    { path: '/academics', icon: '📚', label: 'Academics' },
    { path: '/gym', icon: '🏋️', label: 'Gym & Health' },
    { path: '/social', icon: '🎯', label: 'Social & Goals' },
    { path: '/jobs', icon: '💼', label: 'Job Hunt' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/admin', icon: '🔧', label: 'Admin' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 glass-card border-0 border-r border-white/10 rounded-none overflow-y-auto hidden lg:block">
            <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-link ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Footer in sidebar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <div className="text-center text-xs text-slate-500">
                    <p>v1.0.0</p>
                    <p>Built with ❤️ by You</p>
                </div>
            </div>
        </aside>
    );
};

// Mobile navigation
export const MobileNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-0 border-t border-white/10 rounded-none lg:hidden">
            <div className="flex items-center justify-around py-2">
                {navItems.slice(0, 5).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center p-2 rounded-lg transition-all ${isActive
                                ? 'text-purple-400 bg-purple-500/10'
                                : 'text-slate-400 hover:text-white'
                            }`
                        }
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default Sidebar;
