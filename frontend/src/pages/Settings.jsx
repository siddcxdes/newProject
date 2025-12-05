import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user, updateSettings, logout, updateUserProfile } = useApp();
    const [settings, setSettings] = useState({
        dailyDsaGoal: user?.settings?.dailyDsaGoal || 3,
        weeklyGymGoal: user?.settings?.weeklyGymGoal || 5,
        theme: user?.settings?.theme || 'dark',
    });
    const [name, setName] = useState(user?.name || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await updateSettings(settings);
        setIsSaving(false);
    };

    const handleNameSave = async () => {
        if (!name.trim()) return;
        setIsSaving(true);
        // Update the user name through profile update
        await updateUserProfile({ name: name.trim() });
        setIsEditingName(false);
        setIsSaving(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Settings</h1>
                <p className="text-sm text-zinc-500">Customize your experience and preferences</p>
            </div>

            {/* Profile */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-white mb-4">Profile</h3>
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{(user?.name || 'U')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        {isEditingName ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flex-1 bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                                    placeholder="Enter your name"
                                    autoFocus
                                />
                                <button
                                    onClick={handleNameSave}
                                    disabled={isSaving}
                                    className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors"
                                >
                                    {isSaving ? '...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingName(false);
                                        setName(user?.name || '');
                                    }}
                                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold text-white">{user?.name || 'User'}</p>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-zinc-500">
                            {user?.email || 'No email'}
                        </p>
                        <p className="text-sm text-zinc-500">
                            Level <span className="text-white font-semibold">{user?.level || 1}</span> · <span className="text-violet-400 font-semibold font-mono">{user?.xp || 0}</span> XP
                        </p>
                    </div>
                </div>
                <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#111111]">
                    <p className="stat-label mb-1">Member Since</p>
                    <p className="text-sm font-medium text-white">
                        {user?.journey?.startDate ? new Date(user.journey.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                    </p>
                </div>
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
                    <button onClick={() => setSettings({ ...settings, theme: 'light' })} className={`p-5 rounded-xl border transition-all text-left ${settings.theme === 'light' ? 'border-violet-500 bg-violet-500/10' : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#222]'}`}>
                        <div className="w-10 h-10 bg-white rounded-lg mb-3 border border-zinc-200"></div>
                        <p className="text-sm font-semibold text-white">Light Mode</p>
                        <p className="text-xs text-zinc-500">Clean light theme</p>
                    </button>
                </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full">
                {isSaving ? 'Saving...' : 'Save Settings'}
            </button>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
};

export default Settings;
