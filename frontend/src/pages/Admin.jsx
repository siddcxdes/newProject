import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Admin = () => {
    const {
        user, activities, learningDomains, workouts, goals,
        setLearningDomains, showNotification, resetAll
    } = useApp();

    const [activeTab, setActiveTab] = useState('overview');
    const [jsonInput, setJsonInput] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

    const handleExport = () => {
        const data = {
            user, activities, learningDomains, workouts, goals,
            exportDate: new Date().toISOString()
        };
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
                JSON.parse(event.target?.result);
                showNotification('Data imported! Refresh to see changes.');
            } catch {
                showNotification('Failed to import data', 'error');
            }
        };
        reader.readAsText(file);
    };

    const handleBulkJsonImport = () => {
        if (isImporting) return;
        setIsImporting(true);

        try {
            let parsed = JSON.parse(jsonInput);
            if (!Array.isArray(parsed)) {
                parsed = [parsed];
            }

            // Build entire new domains array in memory
            let newDomains = [...learningDomains];
            let totalItems = 0;
            let newDomainsCount = 0;

            for (const item of parsed) {
                const domainName = item.domain || item.subject;
                const shortName = item.shortName || item['short name'] || domainName;

                if (!domainName) {
                    throw new Error('Missing "domain" field');
                }

                // Find existing domain
                let domainIndex = newDomains.findIndex(d =>
                    d.name.toLowerCase() === domainName.toLowerCase() ||
                    d.shortName.toLowerCase() === shortName.toLowerCase()
                );

                // Create domain if not exists
                if (domainIndex === -1) {
                    const type = /dsa|data.?struct|algorithm|leetcode|array|tree|graph/i.test(domainName)
                        ? 'problem-based' : 'module-based';

                    const newDomain = {
                        id: `domain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: domainName,
                        shortName: shortName,
                        icon: '📚',
                        color: 'violet',
                        type: type,
                        xpPerItem: type === 'problem-based' ? { easy: 10, medium: 25, hard: 50 } : 30,
                        topics: []
                    };
                    newDomains.push(newDomain);
                    domainIndex = newDomains.length - 1;
                    newDomainsCount++;
                }

                // Handle topics
                const topicsArray = Array.isArray(item.topics) ? item.topics : (item.topics ? [item.topics] : []);

                for (const topicName of topicsArray) {
                    if (!topicName) continue;

                    // Find existing topic
                    let topicIndex = newDomains[domainIndex].topics.findIndex(t =>
                        t.name.toLowerCase() === topicName.toLowerCase()
                    );

                    // Create topic if not exists
                    if (topicIndex === -1) {
                        const newTopic = {
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            name: topicName,
                            icon: '📝',
                            completed: 0,
                            total: 0,
                            items: []
                        };
                        newDomains[domainIndex].topics.push(newTopic);
                        topicIndex = newDomains[domainIndex].topics.length - 1;
                    }

                    // Handle subtopics/items
                    const subtopicsArray = Array.isArray(item.subtopics) ? item.subtopics : (item.subtopics ? [item.subtopics] : []);

                    for (const itemName of subtopicsArray) {
                        if (!itemName) continue;

                        // Check if item exists
                        const itemExists = newDomains[domainIndex].topics[topicIndex].items.some(i =>
                            i.name.toLowerCase() === itemName.toLowerCase()
                        );

                        if (!itemExists) {
                            const newItem = {
                                id: Date.now() + Math.floor(Math.random() * 10000),
                                name: itemName,
                                difficulty: newDomains[domainIndex].type === 'problem-based' ? 'medium' : undefined,
                                completed: false
                            };
                            newDomains[domainIndex].topics[topicIndex].items.push(newItem);
                            newDomains[domainIndex].topics[topicIndex].total++;
                            totalItems++;
                        }
                    }
                }
            }

            // Single state update with all changes
            setLearningDomains(newDomains);

            setJsonInput('');
            showNotification(`✅ Imported ${totalItems} items across ${newDomainsCount} new domains!`, 'success');
        } catch (error) {
            console.error('Import error:', error);
            showNotification(`❌ ${error.message}`, 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const exampleJson = `[
  {
    "domain": "Data Structures",
    "shortName": "DSA",
    "topics": "Array",
    "subtopics": ["Two Sum", "Best Time to Buy Stock"]
  },
  {
    "domain": "AI/ML",
    "shortName": "AI",
    "topics": "RAG",
    "subtopics": "RAG Architecture"
  }
]`;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'bulk', label: 'JSON Import' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-heading mb-1">Admin</h1>
                    <p className="text-sm text-zinc-500">Manage data, bulk import, and debug</p>
                </div>
                <button onClick={() => setShowResetConfirm(true)} className="btn-danger text-xs">Reset All Data</button>
            </div>

            {showResetConfirm && (
                <div className="fixed inset-0 bg-elevated/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-card p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-3">Reset All Data?</h3>
                        <p className="text-sm text-zinc-400 mb-5">This will permanently delete all your progress. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => { resetAll(); setShowResetConfirm(false); }} className="flex-1 py-2.5 bg-red-500 text-heading rounded-lg text-sm font-semibold hover:bg-red-600 transition-all">Reset Everything</button>
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2.5 bg-elevated text-zinc-400 rounded-lg text-sm font-medium hover:bg-elevated transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex gap-1 p-1.5 bg-elevated rounded-xl border border-subtle">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-heading'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Level</p>
                        <p className="stat-value">{user?.level || 1}</p>
                        <p className="stat-sublabel text-sky-400 font-semibold">{user?.xp || 0} XP</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Learning Domains</p>
                        <p className="stat-value">{learningDomains.length}</p>
                        <p className="stat-sublabel">{learningDomains.reduce((s, d) => s + (d.topics?.length || 0), 0)} topics</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="stat-label mb-1">Total Items</p>
                        <p className="stat-value">{learningDomains.reduce((s, d) => s + d.topics?.reduce((ts, t) => ts + (t.items?.length || 0), 0), 0)}</p>
                        <p className="stat-sublabel">problems/modules</p>
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

            {activeTab === 'bulk' && (
                <div className="space-y-4">
                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-2">Bulk JSON Import</h3>
                        <p className="text-sm text-zinc-500 mb-4">Import domains, topics, and subtopics. They sync to Academics and CheckIn.</p>

                        <div className="mb-4 p-3 bg-elevated rounded-lg border border-subtle">
                            <p className="text-xs text-zinc-500 mb-2">Required format:</p>
                            <pre className="text-xs text-emerald-400 font-mono overflow-auto">{exampleJson}</pre>
                        </div>

                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder="Paste your JSON here..."
                            className="input-field resize-none mb-4 font-mono text-sm"
                            rows={12}
                            disabled={isImporting}
                        />
                        <button
                            onClick={handleBulkJsonImport}
                            className="btn-primary text-sm"
                            disabled={!jsonInput.trim() || isImporting}
                        >
                            {isImporting ? 'Importing...' : 'Import JSON'}
                        </button>
                    </div>

                    <div className="glass-card p-5">
                        <h3 className="text-base font-semibold text-heading mb-4">Current Learning Domains ({learningDomains.length})</h3>
                        <div className="space-y-2 max-h-96 overflow-auto">
                            {learningDomains.map(domain => (
                                <div key={domain.id} className="p-3 bg-elevated rounded-lg border border-subtle">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-heading">{domain.icon} {domain.name} ({domain.shortName})</span>
                                        <span className="text-xs text-zinc-500">{domain.topics?.length || 0} topics</span>
                                    </div>
                                    {domain.topics?.slice(0, 5).map(topic => (
                                        <div key={topic.id} className="ml-4 text-xs text-zinc-400">
                                            {topic.icon} {topic.name} ({topic.items?.length || 0} items)
                                        </div>
                                    ))}
                                    {domain.topics?.length > 5 && (
                                        <div className="ml-4 text-xs text-zinc-600 italic">...and {domain.topics.length - 5} more topics</div>
                                    )}
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
