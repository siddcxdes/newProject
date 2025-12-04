import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Settings = () => {
    const { user, updateSettings } = useApp();
    const [settings, setSettings] = useState({
        dailyDsaGoal: user?.settings?.dailyDsaGoal || 3,
        weeklyGymGoal: user?.settings?.weeklyGymGoal || 5,
        theme: user?.settings?.theme || 'dark',
    });

    const handleSave = async () => {
        await updateSettings(settings);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Settings</h1>
                <p className="text-sm text-zinc-500">Customize your experience and preferences</p>
            </div>

            {/* Goals Settings */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-5">Daily Goals</h3>
                <div className="space-y-6">
                    <div>
                        <label className="flex items-center justify-between mb-3">
                            <span className="text-sm text-zinc-400">Daily DSA Problems</span>
                            <span className="text-sm font-semibold font-mono text-white">{settings.dailyDsaGoal}</span>
                        </label>
                        <input type="range" min="1" max="10" value={settings.dailyDsaGoal} onChange={(e) => setSettings({ ...settings, dailyDsaGoal: parseInt(e.target.value) })} className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-violet-500" />
                        <div className="flex justify-between text-xs text-zinc-600 mt-2">
                            <span>1 problem</span>
                            <span>10 problems</span>
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center justify-between mb-3">
                            <span className="text-sm text-zinc-400">Weekly Gym Sessions</span>
                            <span className="text-sm font-semibold font-mono text-white">{settings.weeklyGymGoal} days</span>
                        </label>
                        <input type="range" min="1" max="7" value={settings.weeklyGymGoal} onChange={(e) => setSettings({ ...settings, weeklyGymGoal: parseInt(e.target.value) })} className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        <div className="flex justify-between text-xs text-zinc-600 mt-2">
                            <span>1 day</span>
                            <span>7 days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Settings */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Appearance</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setSettings({ ...settings, theme: 'dark' })} className={`p-5 rounded-xl border transition-all text-left ${settings.theme === 'dark' ? 'border-violet-500 bg-violet-500/10' : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#222]'}`}>
                        <div className="w-10 h-10 bg-black rounded-lg mb-3 border border-[#1a1a1a]"></div>
                        <p className="text-sm font-semibold text-white">Dark Mode</p>
                        <p className="text-xs text-zinc-500">Pure black theme</p>
                    </button>
                    <button disabled className="p-5 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] text-left opacity-50 cursor-not-allowed">
                        <div className="w-10 h-10 bg-white rounded-lg mb-3"></div>
                        <p className="text-sm font-semibold text-white">Light Mode</p>
                        <p className="text-xs text-zinc-500">Coming soon</p>
                    </button>
                </div>
            </div>

            {/* Profile */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Profile</h3>
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-xl bg-[#111111] border border-[#1a1a1a] flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{(user?.name || 'U')[0]}</span>
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-white">{user?.name || 'User'}</p>
                        <p className="text-sm text-zinc-500">Level <span className="text-white font-semibold">{user?.level || 1}</span> · <span className="text-violet-400 font-semibold font-mono">{user?.xp || 0}</span> XP</p>
                    </div>
                </div>
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#111111]">
                    <p className="stat-label mb-1">Member Since</p>
                    <p className="text-sm font-medium text-white">
                        {user?.journey?.startDate ? new Date(user.journey.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                    </p>
                </div>
            </div>

            <button onClick={handleSave} className="btn-primary w-full">Save Settings</button>
        </div>
    );
};

export default Settings;
