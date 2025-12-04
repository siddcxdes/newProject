import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Admin = () => {
    const {
        user, activities, dsaTopics, aiModules, workouts, goals,
        addDsaTopic, addAiModule, addWorkout, showNotification
    } = useApp();

    const [activeTab, setActiveTab] = useState('overview');
    const [bulkAddType, setBulkAddType] = useState('dsa');
    const [bulkAddText, setBulkAddText] = useState('');

    // Export data as JSON
    const handleExport = () => {
        const data = {
            user,
            activities,
            dsaTopics,
            aiModules,
            workouts,
            goals,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascension_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully!', 'success');
    };

    // Import data from JSON
    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result);
                // Store in localStorage
                if (data.user) localStorage.setItem('ascension_user', JSON.stringify(data.user));
                if (data.activities) localStorage.setItem('ascension_activities', JSON.stringify(data.activities));
                if (data.dsaTopics) localStorage.setItem('ascension_dsa_topics', JSON.stringify(data.dsaTopics));
                if (data.aiModules) localStorage.setItem('ascension_ai_modules', JSON.stringify(data.aiModules));
                if (data.workouts) localStorage.setItem('ascension_workouts', JSON.stringify(data.workouts));
                if (data.goals) localStorage.setItem('ascension_goals', JSON.stringify(data.goals));

                showNotification('Data imported! Refresh the page to see changes.', 'success');
            } catch (error) {
                showNotification('Failed to import data. Invalid file format.', 'error');
            }
        };
        reader.readAsText(file);
    };

    // Reset all data
    const handleReset = () => {
        if (confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
            const keys = [
                'ascension_user', 'ascension_activities', 'ascension_heatmap',
                'ascension_goals', 'ascension_dsa_topics', 'ascension_ai_modules', 'ascension_workouts'
            ];
            keys.forEach(key => localStorage.removeItem(key));
            showNotification('All data reset! Refresh the page.', 'success');
        }
    };

    // Bulk add items
    const handleBulkAdd = () => {
        const items = bulkAddText.split('\n').map(line => line.trim()).filter(Boolean);
        if (items.length === 0) return;

        items.forEach(item => {
            switch (bulkAddType) {
                case 'dsa':
                    addDsaTopic(item);
                    break;
                case 'ai':
                    addAiModule(item);
                    break;
                case 'workout':
                    addWorkout(item);
                    break;
            }
        });

        setBulkAddText('');
        showNotification(`Added ${items.length} items!`, 'success');
    };

    const tabs = [
        { id: 'overview', label: '📊 Overview', icon: '📊' },
        { id: 'bulk', label: '📦 Bulk Add', icon: '📦' },
        { id: 'export', label: '💾 Export/Import', icon: '💾' },
        { id: 'debug', label: '🔧 Debug', icon: '🔧' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">🔧 Admin Panel</h1>
                <p className="text-slate-400">Manage your data and system settings</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">Level</p>
                        <p className="text-3xl font-bold text-white">{user?.level || 1}</p>
                        <p className="text-sm text-purple-400">{user?.xp || 0} XP</p>
                    </div>
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">DSA Topics</p>
                        <p className="text-3xl font-bold text-white">{dsaTopics.length}</p>
                        <p className="text-sm text-green-400">
                            {dsaTopics.reduce((sum, t) => sum + t.subtopics.length, 0)} problems
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">AI Modules</p>
                        <p className="text-3xl font-bold text-white">{aiModules.length}</p>
                        <p className="text-sm text-blue-400">
                            {aiModules.filter(m => m.completed).length} completed
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">Workouts</p>
                        <p className="text-3xl font-bold text-white">{workouts.length}</p>
                        <p className="text-sm text-orange-400">
                            {workouts.reduce((sum, w) => sum + w.timesCompleted, 0)} sessions
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">Activities Logged</p>
                        <p className="text-3xl font-bold text-white">{activities.length}</p>
                    </div>
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">Goals</p>
                        <p className="text-3xl font-bold text-white">{goals.length}</p>
                        <p className="text-sm text-green-400">
                            {goals.filter(g => g.completed).length} completed
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">Current Streak</p>
                        <p className="text-3xl font-bold text-white">{user?.streak?.current || 0} days</p>
                        <p className="text-sm text-orange-400">
                            Longest: {user?.streak?.longest || 0} days
                        </p>
                    </div>
                    <div className="glass-card p-6">
                        <p className="text-slate-400 text-sm mb-1">Journey Progress</p>
                        <p className="text-3xl font-bold text-white">
                            Week {user?.journey?.currentWeek || 1}
                        </p>
                        <p className="text-sm text-purple-400">of {user?.journey?.totalWeeks || 17}</p>
                    </div>
                </div>
            )}

            {/* Bulk Add Tab */}
            {activeTab === 'bulk' && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Bulk Add Items</h3>
                    <p className="text-slate-400 mb-4">Add multiple items at once (one per line)</p>

                    <div className="mb-4">
                        <label className="text-sm text-slate-400 block mb-2">Item Type</label>
                        <div className="flex gap-2">
                            {[
                                { value: 'dsa', label: '💻 DSA Topics' },
                                { value: 'ai', label: '🤖 AI Modules' },
                                { value: 'workout', label: '🏋️ Workouts' },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setBulkAddType(type.value)}
                                    className={`px-4 py-2 rounded-lg transition-all ${bulkAddType === type.value
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/10 text-slate-400 hover:bg-white/20'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="text-sm text-slate-400 block mb-2">Items (one per line)</label>
                        <textarea
                            value={bulkAddText}
                            onChange={(e) => setBulkAddText(e.target.value)}
                            placeholder={
                                bulkAddType === 'dsa'
                                    ? "Stack\nQueue\nHeap\nTrie"
                                    : bulkAddType === 'ai'
                                        ? "TensorFlow Basics\nPyTorch Advanced\nMLOps"
                                        : "Morning Cardio\nEvening HIIT\nYoga Flow"
                            }
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                            rows={6}
                        />
                    </div>

                    <button onClick={handleBulkAdd} className="btn-primary">
                        Add {bulkAddText.split('\n').filter(Boolean).length} Items
                    </button>
                </div>
            )}

            {/* Export/Import Tab */}
            {activeTab === 'export' && (
                <div className="space-y-4">
                    <div className="glass-card p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Export Data</h3>
                        <p className="text-slate-400 mb-4">Download all your data as a JSON file for backup.</p>
                        <button onClick={handleExport} className="btn-primary">
                            📥 Export All Data
                        </button>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-xl font-semibold text-white mb-4">Import Data</h3>
                        <p className="text-slate-400 mb-4">Restore data from a previously exported JSON file.</p>
                        <label className="btn-secondary cursor-pointer inline-block">
                            📤 Import Data
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <div className="glass-card p-6 border-red-500/30 border-2">
                        <h3 className="text-xl font-semibold text-red-400 mb-4">⚠️ Danger Zone</h3>
                        <p className="text-slate-400 mb-4">Reset all data to defaults. This cannot be undone!</p>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                        >
                            🗑️ Reset All Data
                        </button>
                    </div>
                </div>
            )}

            {/* Debug Tab */}
            {activeTab === 'debug' && (
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Debug Information</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-400 mb-2">User Data</p>
                            <pre className="bg-black/50 p-4 rounded-xl text-xs text-green-400 overflow-auto max-h-64">
                                {JSON.stringify(user, null, 2)}
                            </pre>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 mb-2">Recent Activities ({activities.length} total)</p>
                            <pre className="bg-black/50 p-4 rounded-xl text-xs text-blue-400 overflow-auto max-h-64">
                                {JSON.stringify(activities.slice(0, 10), null, 2)}
                            </pre>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 mb-2">LocalStorage Keys</p>
                            <div className="bg-black/50 p-4 rounded-xl text-xs text-purple-400">
                                {Object.keys(localStorage).filter(k => k.startsWith('ascension')).map(key => (
                                    <div key={key} className="flex justify-between py-1">
                                        <span>{key}</span>
                                        <span className="text-slate-500">
                                            {(localStorage.getItem(key)?.length || 0).toLocaleString()} chars
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
