import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const StreakCard = () => {
    const { user, updateSettings } = useApp();
    const streak = user?.streak || { current: 0, longest: 0 };
    const [isEditing, setIsEditing] = useState(false);
    const [quote, setQuote] = useState(user?.quote || "The only way to do great work is to love what you do.");

    const handleSave = async () => {
        await updateSettings({ quote });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setQuote(user?.quote || "The only way to do great work is to love what you do.");
        setIsEditing(false);
    };

    return (
        <div className="glass-card p-3 sm:p-5 flex flex-col h-full">
            {/* Streak Section */}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-white">Streak</h3>
                    <p className="text-[10px] sm:text-xs text-zinc-500 hidden sm:block">Stay consistent</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-amber-400">{streak.current}</p>
                    <p className="text-[10px] sm:text-xs text-zinc-500">days</p>
                </div>
            </div>

            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#1a1a1a]">
                <span className="text-[10px] sm:text-sm text-zinc-500">Best</span>
                <span className="font-semibold font-mono text-xs sm:text-sm text-amber-400">{streak.longest} days</span>
            </div>

            {/* Quote Section */}
            <div className="flex-1 mt-4 relative">
                <div className="text-[10px] sm:text-xs text-zinc-500 mb-2 flex items-center justify-between">
                    <span>Motivation</span>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="text-zinc-500 hover:text-zinc-400 transition-colors"
                            title="Edit quote"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={quote}
                            onChange={(e) => setQuote(e.target.value)}
                            className="w-full bg-[#0a0a0a] text-zinc-300 text-xs italic resize-none focus:outline-none rounded-lg p-2 border border-zinc-800 focus:border-violet-500 transition-colors"
                            rows={3}
                            placeholder="Enter your motivational quote..."
                            maxLength={150}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                className="px-2 py-1 bg-violet-500 text-white text-[10px] rounded hover:bg-violet-600 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancel}
                                className="px-2 py-1 bg-zinc-700 text-white text-[10px] rounded hover:bg-zinc-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-zinc-400 italic leading-relaxed">
                        "{user?.quote || quote}"
                    </p>
                )}
            </div>
        </div>
    );
};

export default StreakCard;
