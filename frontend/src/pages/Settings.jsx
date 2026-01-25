import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Settings = () => {
    const navigate = useNavigate();
    const { user, updateSettings, logout, updateUserProfile, learningDomains, toggleDomainVisibility } = useApp();
    const [settings, setSettings] = useState({
        weeklyGymGoal: user?.settings?.weeklyGymGoal || 5,
        theme: user?.settings?.theme || 'light',
        showJobSearch: user?.settings?.showJobSearch !== false, // Default to true
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
                <h1 className="text-2xl font-semibold text-heading mb-1">Settings</h1>
                <p className="text-sm text-zinc-500">Customize your experience and preferences</p>
            </div>

            {/* Profile */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-heading mb-4">Profile</h3>
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-600 to-cyan-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-heading">{(user?.name || 'U')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1">
                        {isEditingName ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flex-1 bg-elevated border border-subtle rounded-lg px-3 py-2 text-heading text-sm focus:outline-none focus:border-sky-500"
                                    placeholder="Enter your name"
                                    autoFocus
                                />
                                <button
                                    onClick={handleNameSave}
                                    disabled={isSaving}
                                    className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-heading text-sm rounded-lg transition-colors"
                                >
                                    {isSaving ? '...' : 'Save'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingName(false);
                                        setName(user?.name || '');
                                    }}
                                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-heading text-sm rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold text-heading">{user?.name || 'User'}</p>
                                <button
                                    onClick={() => setIsEditingName(true)}
                                    className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                                >
                                    Edit
                                </button>
                            </div>
                        )}
                        <p className="text-sm text-zinc-500">
                            {user?.email || 'No email'}
                        </p>
                        <p className="text-sm text-zinc-500">
                            Level <span className="text-heading font-semibold">{user?.level || 1}</span> · <span className="text-sky-400 font-semibold font-mono">{user?.xp || 0}</span> XP
                        </p>
                    </div>
                </div>
                <div className="bg-elevated rounded-xl p-4 border border-subtle">
                    <p className="stat-label mb-1">Member Since</p>
                    <p className="text-sm font-medium text-heading">
                        {user?.journey?.startDate ? new Date(user.journey.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}
                    </p>
                </div>
            </div>

            {/* Goals Settings */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-heading mb-5">Gym Goals</h3>
                <div className="space-y-6">
                    <div>
                        <label className="flex items-center justify-between mb-3">
                            <span className="text-sm text-zinc-400">Weekly Gym Sessions</span>
                            <span className="text-sm font-semibold font-mono text-heading">{settings.weeklyGymGoal} days</span>
                        </label>
                        <input type="range" min="1" max="7" value={settings.weeklyGymGoal} onChange={(e) => setSettings({ ...settings, weeklyGymGoal: parseInt(e.target.value) })} className="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                        <div className="flex justify-between text-xs text-zinc-600 mt-2">
                            <span>1 day</span>
                            <span>7 days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Learning Domains */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-heading mb-4">Focus Areas</h3>
                <p className="text-sm text-zinc-500 mb-4">Select the domains you want to track in your daily check-in.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {learningDomains && learningDomains.map((domain) => (
                        <div key={domain.id} className="flex items-center justify-between p-3 bg-elevated border border-subtle rounded-lg">
                            <div className="flex items-center gap-3">
                                {/* Color Indicator instead of Emoji */}
                                <div className={`w-2 h-8 rounded-full bg-${domain.color === 'violet' ? 'sky' : domain.color}-500/50`}></div>
                                <div>
                                    <p className="text-sm font-semibold text-heading">{domain.shortName || domain.name}</p>
                                    <p className="text-xs text-zinc-500">{domain.topics?.length || 0} topics</p>
                                </div>
                            </div>

                            <label className="flex items-center cursor-pointer relative">
                                <input
                                    type="checkbox"
                                    checked={domain.showInCheckIn !== false}
                                    onChange={() => toggleDomainVisibility(domain.id)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Settings */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-heading mb-4">Features</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-heading">Job Search</p>
                            <p className="text-xs text-zinc-500">Show job search section in sidebar</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, showJobSearch: !settings.showJobSearch })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.showJobSearch ? 'bg-sky-600' : 'bg-zinc-700'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showJobSearch ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-subtle">
                        <div>
                            <p className="text-sm text-heading">Browser Notifications</p>
                            <p className="text-xs text-zinc-500">Get reminders for scheduled tasks</p>
                        </div>
                        <button
                            onClick={async () => {
                                const granted = await Notification.requestPermission();
                                if (granted === 'granted') {
                                    alert('✅ Notifications enabled! You\'ll get reminders 15 minutes before tasks.');
                                } else {
                                    alert('❌ Notifications blocked. Enable them in your browser settings.');
                                }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${Notification.permission === 'granted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                                }`}
                        >
                            {Notification.permission === 'granted' ? 'Enabled' : 'Enable'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Theme Settings */}
            <div className="glass-card p-5">
                <h3 className="text-base font-semibold text-heading mb-4">Appearance</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setSettings({ ...settings, theme: 'dark' })} className={`p-5 rounded-xl border transition-all text-left ${settings.theme === 'dark' ? 'border-sky-500 bg-sky-500/10' : 'border-subtle bg-elevated hover:border-subtle'}`}>
                        <div className="w-10 h-10 bg-elevated rounded-lg mb-3 border border-subtle"></div>
                        <p className="text-sm font-semibold text-heading">Dark Mode</p>
                        <p className="text-xs text-zinc-500">Pure black theme</p>
                    </button>
                    <button onClick={() => setSettings({ ...settings, theme: 'light' })} className={`p-5 rounded-xl border transition-all text-left ${settings.theme === 'light' ? 'border-sky-500 bg-sky-500/10' : 'border-subtle bg-elevated hover:border-subtle'}`}>
                        <div className="w-10 h-10 bg-white rounded-lg mb-3 border border-zinc-200"></div>
                        <p className="text-sm font-semibold text-heading">Light Mode</p>
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
