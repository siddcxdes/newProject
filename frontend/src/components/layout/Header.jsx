import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';

const Header = () => {
    const { user, lastSaved } = useApp();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const xpProgress = user ? ((user.xp % 500) / 500) * 100 : 0;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#050505] border-b border-[#111]">
            <div className="h-full max-w-[1400px] mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <NavLink to="/" className="flex items-center gap-3 group">
                    <div className="relative w-8 h-8">
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-lg rotate-45 group-hover:rotate-[50deg] transition-transform duration-300"></div>
                        <div className="absolute inset-[2px] bg-[#050505] rounded-[6px] rotate-45"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                            </svg>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-sm font-bold text-white tracking-wide leading-none">ASCENSION</h1>
                        <p className="text-[8px] text-zinc-600 tracking-[0.15em] uppercase mt-0.5">Track · Build · Level Up</p>
                    </div>
                </NavLink>

                {/* Center - Level Progress */}
                <div className="hidden lg:flex items-center gap-4 bg-[#0a0a0a] px-4 py-1.5 rounded-full border border-[#151515]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">{user?.level || 1}</span>
                        </div>
                        <div>
                            <p className="text-[9px] text-zinc-600 leading-none">LEVEL</p>
                            <p className="text-[11px] text-white font-semibold leading-none mt-0.5">{user?.xp || 0} XP</p>
                        </div>
                    </div>

                    <div className="w-24 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                            style={{ width: `${xpProgress}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L9 9H2L7 14L5 21L12 17L19 21L17 14L22 9H15L12 2Z" />
                        </svg>
                        <span className="text-amber-400 font-bold font-mono text-xs">{user?.streak?.current || 0}</span>
                        <span className="text-zinc-600 text-[10px]">streak</span>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-3">
                    {/* Time */}
                    <div className="hidden sm:flex items-center gap-1.5">
                        <span className="text-white font-mono text-sm font-medium">{formatTime(currentTime)}</span>
                        <span className="text-zinc-700 text-xs">IST</span>
                    </div>

                    {/* Sync Status */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#0a0a0a] border border-[#151515]">
                        <div className={`w-1.5 h-1.5 rounded-full ${lastSaved ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                        <span className="text-[9px] text-zinc-500 font-medium uppercase tracking-wide">
                            {lastSaved ? 'Synced' : 'Offline'}
                        </span>
                    </div>

                    {/* Mobile Level Badge */}
                    <div className="lg:hidden flex items-center px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20">
                        <span className="text-[10px] font-bold text-violet-400">LVL {user?.level || 1}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
