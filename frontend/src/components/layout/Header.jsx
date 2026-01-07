import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';

const Header = () => {
    const { user, lastSaved, updateSettings } = useApp();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [theme, setTheme] = useState(() => localStorage.getItem('ascension_theme') || 'dark');

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ascension_theme', newTheme);
        updateSettings({ theme: newTheme });
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] safe-area-pt">
            <div className="h-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-2 sm:gap-3 group">
                    <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-600 to-cyan-500 rounded-lg rotate-45 group-hover:rotate-[50deg] transition-transform duration-300"></div>
                        <div className="absolute inset-[2px] bg-[var(--color-bg-primary)] rounded-[5px] sm:rounded-[6px] rotate-45"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                        </div>
                    </div>
                    <div className="hidden xs:block sm:block">
                        <h1 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] tracking-wide leading-none">ASCENSION</h1>
                        <p className="text-[7px] sm:text-[8px] text-[var(--color-text-muted)] tracking-[0.1em] sm:tracking-[0.15em] uppercase mt-0.5">Level Up Daily</p>
                    </div>
                </NavLink>

                {/* Center Stats - Desktop Only */}
                <div className="hidden lg:flex items-center gap-4 bg-[var(--color-bg-secondary)] px-4 py-1.5 rounded-full border border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-heading text-[10px] font-bold">{user?.level || 1}</span>
                        </div>
                        <div>
                            <p className="text-[9px] text-[var(--color-text-muted)] leading-none">LEVEL</p>
                            <p className="text-[11px] text-[var(--color-text-primary)] font-semibold leading-none mt-0.5">{user?.xp || 0} XP</p>
                        </div>
                    </div>

                    <div className="w-20 h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full"
                            style={{ width: `${((user?.xp || 0) % 500) / 5}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L9 9H2L7 14L5 21L12 17L19 21L17 14L22 9H15L12 2Z" />
                        </svg>
                        <span className="text-amber-400 font-bold font-mono text-xs">{user?.streak?.current || 0}</span>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? (
                            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {/* Mobile Level Badge */}
                    <div className="lg:hidden flex items-center gap-1 px-2 py-1 rounded-md bg-sky-500/10 border border-sky-500/20">
                        <span className="text-[9px] sm:text-[10px] font-bold text-sky-400">LV{user?.level || 1}</span>
                        <span className="text-[9px] sm:text-[10px] font-mono text-amber-400">{user?.streak?.current || 0}🔥</span>
                    </div>

                    {/* Time - Tablet+ */}
                    <div className="hidden sm:flex items-center gap-1.5">
                        <span className="text-[var(--color-text-primary)] font-mono text-xs sm:text-sm font-medium">{formatTime(currentTime)}</span>
                    </div>

                    {/* Sync Status */}
                    <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                        <div className={`w-1.5 h-1.5 rounded-full ${lastSaved ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                        <span className="text-[8px] sm:text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wide">
                            {lastSaved ? 'Sync' : 'Off'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
