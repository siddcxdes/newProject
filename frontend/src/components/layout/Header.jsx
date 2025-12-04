import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatTime, formatDate } from '../../utils/dateUtils';
import { useState, useEffect } from 'react';

const Header = () => {
    const { user, lastSaved, useLocalStorage, undo, redo, canUndo, canRedo } = useApp();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getLastSavedText = () => {
        if (!lastSaved) return 'Not saved yet';
        const diff = Math.floor((new Date() - lastSaved) / 1000);
        if (diff < 5) return 'Just saved';
        if (diff < 60) return `Saved ${diff}s ago`;
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
        return `Saved ${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass-card border-0 border-b border-white/10 rounded-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Brand */}
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <span className="text-3xl group-hover:animate-bounce-slow">🚀</span>
                        <div>
                            <h1 className="text-xl font-bold gradient-text">Ascension</h1>
                            <p className="text-xs text-slate-400">Your Journey to Success</p>
                        </div>
                    </NavLink>

                    {/* Center - Date & Time */}
                    <div className="hidden md:flex flex-col items-center">
                        <p className="text-sm text-slate-300">{formatDate(currentTime)}</p>
                        <p className="text-lg font-semibold text-white">{formatTime(currentTime)}</p>
                    </div>

                    {/* Right - Undo/Redo, Level & Save Status */}
                    <div className="flex items-center gap-4">
                        {/* Undo/Redo buttons */}
                        <div className="hidden sm:flex items-center gap-1">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`p-2 rounded-lg transition-all ${canUndo
                                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        : 'text-slate-600 cursor-not-allowed'
                                    }`}
                                title="Undo (Ctrl+Z)"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`p-2 rounded-lg transition-all ${canRedo
                                        ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        : 'text-slate-600 cursor-not-allowed'
                                    }`}
                                title="Redo (Ctrl+Shift+Z)"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                                </svg>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-6 bg-white/10"></div>

                        {/* Auto-save indicator */}
                        <div className="hidden sm:flex items-center gap-2 text-xs">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-slate-400">{getLastSavedText()}</span>
                            {useLocalStorage && (
                                <span className="text-xs text-amber-400 ml-1">(local)</span>
                            )}
                        </div>

                        {/* Level Badge */}
                        {user && (
                            <div className="level-badge">
                                <span>⭐</span>
                                <span>Level {user.level}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
