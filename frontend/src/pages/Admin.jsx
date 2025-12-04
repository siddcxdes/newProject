import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Admin = () => {
    const { user, activities, dsaTopics, aiModules, workouts, goals, addDsaTopic, addAiModule, addWorkout, showNotification, resetAll } = useApp();
    const [activeTab, setActiveTab] = useState('overview');
    const [bulkAddType, setBulkAddType] = useState('dsa');
    const [bulkAddText, setBulkAddText] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const handleExport = () => {
        const data = { user, activities, dsaTopics, aiModules, workouts, goals, exportDate: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascension_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('Data exported successfully');
    };

    const handleImport = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result);
                ['user', 'activities', 'dsaTopics', 'aiModules', 'workouts', 'goals'].forEach(key => {
                    if (data[key]) localStorage.setItem(`ascension_${key === 'dsaTopics' ? 'dsa_topics' : key === 'aiModules' ? 'ai_modules' : key}`, JSON.stringify(data[key]));
                });
                showNotification('Data imported successfully! Refresh to see changes.');
            } catch {
                showNotification('Failed to import data', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleBulkAdd = () => {
        const items = bulkAddText.split('\n').map(line => line.trim()).filter(Boolean);
        if (items.length === 0) return;
        items.forEach(item => {
            if (bulkAddType === 'dsa') addDsaTopic(item);
            else if (bulkAddType === 'ai') addAiModule(item);
            else addWorkout(item);
        });
        setBulkAddText('');
        showNotification(`Added ${items.length} ${bulkAddType.toUpperCase()} items`);
    };

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'bulk', label: 'Bulk Add' },
        { id: 'export', label: 'Export/Import' },
        { id: 'debug', label: 'Debug' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-white mb-1">Admin</h1>
                    <p className="text-sm text-zinc-500">Manage data, import/export, and debug</p>
                </div>
                <button onClick={() => setShowResetConfirm(true)} className="btn-danger text-xs">Reset All Data</button>
            </div>

            {/* Reset Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-3">Reset All Data?</h3>
                        <p className="text-sm text-zinc-400 mb-5">This will permanently delete all your progress, activities, and settings. This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => { resetAll(); setShowResetConfirm(false); }} className="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-all">Reset Everything</button>
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-[#111111] text-zinc-400 rounded-lg text-sm font-medium hover:bg-[#1a1a1a] transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-[#0a0a0a] rounded-xl border border-[#111111]">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Level</p>
                        <p className="stat-value">{user?.level || 1}</p>
                        <p className="stat-sublabel text-violet-400 font-semibold">{user?.xp || 0} XP</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">DSA Topics</p>
                        <p className="stat-value">{dsaTopics.length}</p>
                        <p className="stat-sublabel">{dsaTopics.reduce((s, t) => s + t.subtopics.length, 0)} problems</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">AI Modules</p>
                        <p className="stat-value">{aiModules.length}</p>
                        <p className="stat-sublabel">{aiModules.filter(m => m.completed).length} completed</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Workouts</p>
                        <p className="stat-value">{workouts.length}</p>
                        <p className="stat-sublabel">{workouts.reduce((s, w) => s + w.timesCompleted, 0)} sessions</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Activities</p>
                        <p className="stat-value">{activities.length}</p>
                        <p className="stat-sublabel">logged</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Goals</p>
                        <p className="stat-value">{goals.length}</p>
                        <p className="stat-sublabel">{goals.filter(g => g.completed).length} done</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Streak</p>
                        <p className="stat-value text-amber-400">{user?.streak?.current || 0}d</p>
                        <p className="stat-sublabel">Best: {user?.streak?.longest || 0}d</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Week</p>
                        <p className="stat-value">{user?.journey?.currentWeek || 1}</p>
                        <p className="stat-sublabel">of {user?.journey?.totalWeeks || 17}</p>
                    </div>
                </div>
            )}

            {/* Bulk Add */}
            {activeTab === 'bulk' && (
                <div className="glass-card p-5">
                    <h3 className="text-base font-semibold text-white mb-4">Bulk Add Items</h3>
                    <div className="mb-4 flex gap-2">
                        {[{ v: 'dsa', l: 'DSA Topics' }, { v: 'ai', l: 'AI Modules' }, { v: 'workout', l: 'Workouts' }].map((t) => (
                            <button key={t.v} onClick={() => setBulkAddType(t.v)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${bulkAddType === t.v ? 'bg-white text-black' : 'bg-[#111111] text-zinc-400 hover:text-white'}`}>
                                {t.l}
                            </button>
                        ))}
                    </div>
                    <textarea value={bulkAddText} onChange={(e) => setBulkAddText(e.target.value)} placeholder="Enter one item per line..." className="input-field resize-none mb-4" rows={8} />
                    <button onClick={handleBulkAdd} className="btn-primary text-sm" disabled={!bulkAddText.trim()}>
                        Add {bulkAddText.split('\n').filter(Boolean).length} Items
                    </button>
                </div>
            )}

            {/* Export/Import */}
            {activeTab === 'export' && (
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-white mb-2">Export Data</h3>
                        <p className="text-sm text-zinc-500 mb-4">Download all your data as a JSON backup file.</p>
                        <button onClick={handleExport} className="btn-primary text-sm">Download Backup</button>
                    </div>
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-white mb-2">Import Data</h3>
                        <p className="text-sm text-zinc-500 mb-4">Restore your data from a previous backup file.</p>
                        <label className="btn-secondary text-sm cursor-pointer inline-block">
                            Upload Backup File
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>
                </div>
            )}

            {/* Debug */}
            {activeTab === 'debug' && (
                <div className="glass-card p-5 space-y-5">
                    <div>
                        <p className="stat-label mb-2">User Data</p>
                        <pre className="bg-black p-4 rounded-xl text-xs text-emerald-400 overflow-auto max-h-48 border border-[#111111] font-mono">{JSON.stringify(user, null, 2)}</pre>
                    </div>
                    <div>
                        <p className="stat-label mb-2">LocalStorage Keys</p>
                        <div className="bg-black p-4 rounded-xl text-sm border border-[#111111]">
                            {Object.keys(localStorage).filter(k => k.startsWith('ascension')).map(key => (
                                <div key={key} className="flex justify-between py-2 border-b border-[#111111] last:border-0">
                                    <span className="text-violet-400 font-mono text-xs">{key}</span>
                                    <span className="text-zinc-500 text-xs">{(localStorage.getItem(key)?.length || 0).toLocaleString()} chars</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
