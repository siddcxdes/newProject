import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Settings = () => {
    const { user, updateSettings, showNotification } = useApp();
    const [settings, setSettings] = useState({
        dailyDsaGoal: user?.settings?.dailyDsaGoal || 3,
        weeklyGymGoal: user?.settings?.weeklyGymGoal || 5,
        theme: user?.settings?.theme || 'dark',
    });

    const handleSave = async () => {
        await updateSettings(settings);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">⚙️ Settings</h1>
                <p className="text-slate-400">Customize your Ascension experience</p>
            </div>

            {/* Goals Settings */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Daily Goals</h3>

                <div className="space-y-6">
                    {/* DSA Goal */}
                    <div>
                        <label className="flex items-center justify-between mb-3">
                            <span className="text-white">Daily DSA Problems</span>
                            <span className="text-purple-400 font-semibold">{settings.dailyDsaGoal}</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={settings.dailyDsaGoal}
                            onChange={(e) => setSettings({ ...settings, dailyDsaGoal: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>1 problem</span>
                            <span>10 problems</span>
                        </div>
                    </div>

                    {/* Gym Goal */}
                    <div>
                        <label className="flex items-center justify-between mb-3">
                            <span className="text-white">Weekly Gym Sessions</span>
                            <span className="text-green-400 font-semibold">{settings.weeklyGymGoal} days</span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="7"
                            value={settings.weeklyGymGoal}
                            onChange={(e) => setSettings({ ...settings, weeklyGymGoal: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>1 day</span>
                            <span>7 days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Settings */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Appearance</h3>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setSettings({ ...settings, theme: 'dark' })}
                        className={`p-4 rounded-xl border-2 transition-all ${settings.theme === 'dark'
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/10 bg-white/5'
                            }`}
                    >
                        <span className="text-3xl block mb-2">🌙</span>
                        <p className="text-white font-medium">Dark Mode</p>
                    </button>
                    <button
                        onClick={() => setSettings({ ...settings, theme: 'light' })}
                        className={`p-4 rounded-xl border-2 transition-all ${settings.theme === 'light'
                                ? 'border-purple-500 bg-purple-500/20'
                                : 'border-white/10 bg-white/5'
                            }`}
                    >
                        <span className="text-3xl block mb-2">☀️</span>
                        <p className="text-white font-medium">Light Mode</p>
                        <p className="text-xs text-slate-400">(Coming Soon)</p>
                    </button>
                </div>
            </div>

            {/* Profile */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Profile</h3>

                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                        🚀
                    </div>
                    <div>
                        <p className="text-xl font-bold text-white">{user?.name || 'Champion'}</p>
                        <p className="text-slate-400">Level {user?.level || 1} • {user?.xp || 0} XP</p>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-2">Member since</p>
                    <p className="text-white">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'Today'}
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                className="btn-primary w-full"
            >
                Save Settings
            </button>
        </div>
    );
};

export default Settings;
