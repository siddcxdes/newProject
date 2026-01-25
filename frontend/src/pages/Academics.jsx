import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Academics = () => {
    const {
        dsaTopics, aiModules, logActivity, learningDomains,
        addDsaTopic, editDsaTopic, deleteDsaTopic, addDsaSubtopic, toggleDsaSubtopic, deleteDsaSubtopic,
        addAiModule, editAiModule, deleteAiModule, addAiLesson, toggleAiLesson, completeAiModule,
        addLearningDomain, editLearningDomain, deleteLearningDomain,
        addDomainTopic, editDomainTopic, deleteDomainTopic,
        addDomainItem, toggleDomainItem, deleteDomainItem
    } = useApp();

    const [activeSection, setActiveSection] = useState('dsa');
    const [expandedDsaTopic, setExpandedDsaTopic] = useState(null);
    const [expandedAiModule, setExpandedAiModule] = useState(null);
    const [showAddDsaTopic, setShowAddDsaTopic] = useState(false);
    const [showAddAiModule, setShowAddAiModule] = useState(false);
    const [newDsaTopicName, setNewDsaTopicName] = useState('');
    const [newAiModuleName, setNewAiModuleName] = useState('');
    const [showAddProblem, setShowAddProblem] = useState(null);
    const [showAddLesson, setShowAddLesson] = useState(null);
    const [newProblemName, setNewProblemName] = useState('');
    const [newProblemDifficulty, setNewProblemDifficulty] = useState('medium');
    const [newLessonName, setNewLessonName] = useState('');
    const [editingTopic, setEditingTopic] = useState(null);
    const [editingModule, setEditingModule] = useState(null);

    // Domain editing state
    const [showAddDomain, setShowAddDomain] = useState(false);
    const [newDomainName, setNewDomainName] = useState('');
    const [newDomainShortName, setNewDomainShortName] = useState('');
    const [newDomainIcon, setNewDomainIcon] = useState('📚');
    const [newDomainColor, setNewDomainColor] = useState('blue');
    const [newDomainType, setNewDomainType] = useState('module-based');
    const [editingDomain, setEditingDomain] = useState(null);
    const [activeDomain, setActiveDomain] = useState(null);
    const [expandedDomainTopic, setExpandedDomainTopic] = useState(null);
    const [showAddDomainTopic, setShowAddDomainTopic] = useState(false);
    const [newDomainTopicName, setNewDomainTopicName] = useState('');
    const [showAddDomainItem, setShowAddDomainItem] = useState(null);
    const [newDomainItemName, setNewDomainItemName] = useState('');
    const [newDomainItemDifficulty, setNewDomainItemDifficulty] = useState('medium');
    const [editingDomainTopic, setEditingDomainTopic] = useState(null);

    // Stats
    const totalDsaProblems = dsaTopics.reduce((sum, t) => sum + t.subtopics.length, 0);
    const totalDsaSolved = dsaTopics.reduce((sum, t) => sum + t.completed, 0);
    const dsaProgress = totalDsaProblems > 0 ? Math.round((totalDsaSolved / totalDsaProblems) * 100) : 0;

    const totalAiLessons = aiModules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedAiLessons = aiModules.reduce((sum, m) => sum + m.lessons.filter(l => l.completed).length, 0);
    const totalAiCompleted = aiModules.filter(m => m.completed).length;
    const aiProgress = totalAiLessons > 0 ? Math.round((completedAiLessons / totalAiLessons) * 100) : 0;

    const handleAddDsaTopic = () => {
        if (!newDsaTopicName.trim()) return;
        addDsaTopic(newDsaTopicName.trim());
        setNewDsaTopicName('');
        setShowAddDsaTopic(false);
    };

    const handleAddAiModule = () => {
        if (!newAiModuleName.trim()) return;
        addAiModule(newAiModuleName.trim());
        setNewAiModuleName('');
        setShowAddAiModule(false);
    };

    const handleAddProblem = (topicId) => {
        if (!newProblemName.trim()) return;
        addDsaSubtopic(topicId, newProblemName.trim(), newProblemDifficulty);
        setNewProblemName('');
        setNewProblemDifficulty('medium');
        setShowAddProblem(null);
    };

    const handleAddLesson = (moduleId) => {
        if (!newLessonName.trim()) return;
        addAiLesson(moduleId, newLessonName.trim());
        setNewLessonName('');
        setShowAddLesson(null);
    };

    const difficultyConfig = {
        easy: { label: 'Easy', color: 'emerald', xp: 10 },
        medium: { label: 'Medium', color: 'amber', xp: 25 },
        hard: { label: 'Hard', color: 'red', xp: 50 }
    };

    const colorOptions = ['violet', 'emerald', 'blue', 'amber', 'red', 'pink', 'cyan', 'orange'];

    // Domain handlers
    const handleAddDomain = () => {
        if (!newDomainName.trim()) return;
        addLearningDomain(
            newDomainName.trim(),
            newDomainShortName.trim() || newDomainName.trim().substring(0, 10),
            '', // No icon
            newDomainColor,
            newDomainType
        );
        setNewDomainName('');
        setNewDomainShortName('');
        setNewDomainIcon(''); // Reset to empty
        setNewDomainColor('blue');
        setNewDomainType('module-based');
        setShowAddDomain(false);
    };

    const handleAddDomainTopicLocal = () => {
        if (!newDomainTopicName.trim() || !activeDomain) return;
        addDomainTopic(activeDomain, newDomainTopicName.trim());
        setNewDomainTopicName('');
        setShowAddDomainTopic(false);
    };

    const handleAddDomainItemLocal = (topicId) => {
        if (!newDomainItemName.trim() || !activeDomain) return;
        addDomainItem(activeDomain, topicId, newDomainItemName.trim(), newDomainItemDifficulty);
        setNewDomainItemName('');
        setNewDomainItemDifficulty('medium');
        setShowAddDomainItem(null);
    };

    // Get domain names for subtitle
    const domainNames = learningDomains.map(d => d.shortName).join(', ') || 'custom domains';

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-heading mb-1">Academics</h1>
                    <p className="text-sm text-zinc-500">Master DSA, AI/ML, and custom domains</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowAddDomain(true)} className="btn-secondary text-xs">
                        + Add Domain
                    </button>
                </div>
            </div>

            {/* Add Domain Modal */}
            {showAddDomain && (
                <div className="glass-card p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-heading">Add New Learning Domain</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                            type="text"
                            value={newDomainName}
                            onChange={(e) => setNewDomainName(e.target.value)}
                            placeholder="Domain name (e.g., CSS, Web Dev)"
                            className="input-field"
                            autoFocus
                        />
                        <input
                            type="text"
                            value={newDomainShortName}
                            onChange={(e) => setNewDomainShortName(e.target.value)}
                            placeholder="Short name (e.g., CSS)"
                            className="input-field"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {/* Icon selector removed */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Color:</span>
                            <select value={newDomainColor} onChange={(e) => setNewDomainColor(e.target.value)} className="input-field w-24">
                                <option value="blue">Blue</option>
                                <option value="violet">Violet</option>
                                <option value="emerald">Emerald</option>
                                <option value="amber">Amber</option>
                                <option value="pink">Pink</option>
                                <option value="cyan">Cyan</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">Type:</span>
                            <select value={newDomainType} onChange={(e) => setNewDomainType(e.target.value)} className="input-field w-36">
                                <option value="module-based">Module (flat XP)</option>
                                <option value="problem-based">Problem (difficulty)</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleAddDomain} className="btn-primary text-xs">Create Domain</button>
                        <button onClick={() => setShowAddDomain(false)} className="btn-secondary text-xs">Cancel</button>
                    </div>
                </div>
            )}

            {/* Custom Learning Domains */}
            {learningDomains.length > 0 && (
                <div className="glass-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-heading">Your Custom Domains</h3>
                        <span className="text-xs text-zinc-500">{learningDomains.length} domains</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {learningDomains.map((domain) => {
                            const totalItems = domain.topics?.reduce((sum, t) => sum + (t.items?.length || 0), 0) || 0;
                            const completedItems = domain.topics?.reduce((sum, t) => sum + (t.items?.filter(i => i.completed).length || 0), 0) || 0;
                            const isActive = activeDomain === domain.id;
                            const colorClass = domain.color === 'violet' ? 'bg-sky-500' :
                                domain.color === 'emerald' ? 'bg-emerald-500' :
                                    domain.color === 'blue' ? 'bg-blue-500' :
                                        domain.color === 'amber' ? 'bg-amber-500' :
                                            domain.color === 'pink' ? 'bg-pink-500' :
                                                'bg-zinc-500';

                            return (
                                <div
                                    key={domain.id}
                                    onClick={() => setActiveDomain(isActive ? null : domain.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${isActive ? 'bg-sky-500/10 border-sky-500/30' : 'bg-elevated border-subtle hover:border-zinc-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-8 rounded-full ${colorClass}`}></div>
                                        <div>
                                            <p className="text-sm font-semibold text-heading">{domain.shortName}</p>
                                            <p className="text-[10px] text-zinc-500">{completedItems}/{totalItems} done</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {/* Toggle: include in Daily Check-In */}
                                        <label
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-1.5 cursor-pointer bg-elevated px-2 py-1 rounded border border-subtle hover:border-zinc-600 transition-colors"
                                            title="Show this domain in Daily Check-In"
                                        >
                                            <input
                                                type="checkbox"
                                                className="accent-sky-500 rounded-sm w-3 h-3"
                                                checked={domain.showInCheckIn !== false}
                                                onChange={(e) => editLearningDomain(domain.id, { showInCheckIn: e.target.checked })}
                                            />
                                            <span className="text-[10px] text-zinc-500">Check-In</span>
                                        </label>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteLearningDomain(domain.id); }}
                                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Active Domain Detail View */}
            {activeDomain && (() => {
                const domain = learningDomains.find(d => d.id === activeDomain);
                if (!domain) return null;

                // Color mapping for the large detail view indicator
                const colorDotClass = domain.color === 'violet' ? 'bg-sky-500' :
                    domain.color === 'emerald' ? 'bg-emerald-500' :
                        domain.color === 'blue' ? 'bg-blue-500' :
                            domain.color === 'amber' ? 'bg-amber-500' :
                                domain.color === 'pink' ? 'bg-pink-500' :
                                    'bg-zinc-500';

                return (
                    <div className="glass-card p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Replaced icon with colored bar/dot */}
                                <div className={`w-2 h-10 rounded-full ${colorDotClass}`}></div>
                                <div>
                                    <h2 className="text-lg font-semibold text-heading">{domain.name}</h2>
                                    <p className="text-xs text-zinc-500">{domain.type === 'problem-based' ? 'Difficulty-based XP' : 'Flat XP per item'}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddDomainTopic(true)} className="btn-secondary text-xs">+ Add Topic</button>
                        </div>

                        {showAddDomainTopic && (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newDomainTopicName}
                                    onChange={(e) => setNewDomainTopicName(e.target.value)}
                                    placeholder="Topic name"
                                    className="input-field flex-1"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddDomainTopicLocal()}
                                />
                                <button onClick={handleAddDomainTopicLocal} className="btn-primary text-xs">Add</button>
                                <button onClick={() => setShowAddDomainTopic(false)} className="btn-secondary text-xs">Cancel</button>
                            </div>
                        )}

                        {(!domain.topics || domain.topics.length === 0) ? (
                            <p className="text-center text-zinc-600 py-8">No topics yet. Add your first topic!</p>
                        ) : (
                            <div className="space-y-3">
                                {domain.topics.map((topic) => (
                                    <div key={topic.id} className="bg-elevated rounded-xl overflow-hidden">
                                        <div
                                            className="p-4 cursor-pointer flex items-center gap-3 hover:bg-elevated"
                                            onClick={() => setExpandedDomainTopic(expandedDomainTopic === topic.id ? null : topic.id)}
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-heading">{topic.name}</p>
                                                <p className="text-xs text-zinc-500">{topic.completed || 0}/{topic.items?.length || 0} completed</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); deleteDomainTopic(domain.id, topic.id); }} className="p-1 text-zinc-600 hover:text-red-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                            <svg className={`w-5 h-5 text-zinc-500 transition-transform ${expandedDomainTopic === topic.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" /></svg>
                                        </div>

                                        {expandedDomainTopic === topic.id && (
                                            <div className="p-4 border-t border-subtle bg-elevated">
                                                {showAddDomainItem === topic.id ? (
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        <input
                                                            type="text"
                                                            value={newDomainItemName}
                                                            onChange={(e) => setNewDomainItemName(e.target.value)}
                                                            placeholder="Item name"
                                                            className="input-field flex-1 text-sm"
                                                            autoFocus
                                                            onKeyDown={(e) => e.key === 'Enter' && handleAddDomainItemLocal(topic.id)}
                                                        />
                                                        {domain.type === 'problem-based' && (
                                                            <select value={newDomainItemDifficulty} onChange={(e) => setNewDomainItemDifficulty(e.target.value)} className="input-field w-24 text-xs">
                                                                <option value="easy">Easy</option>
                                                                <option value="medium">Medium</option>
                                                                <option value="hard">Hard</option>
                                                            </select>
                                                        )}
                                                        <button onClick={() => handleAddDomainItemLocal(topic.id)} className="btn-primary text-xs">Add</button>
                                                        <button onClick={() => setShowAddDomainItem(null)} className="px-3 py-2 text-zinc-500 text-sm">×</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowAddDomainItem(topic.id)}
                                                        className="w-full py-3 border border-dashed border-subtle rounded-xl text-zinc-500 hover:border-blue-500/50 hover:text-blue-400 text-sm font-medium transition-all mb-3"
                                                    >
                                                        + Add Item
                                                    </button>
                                                )}

                                                {(!topic.items || topic.items.length === 0) ? (
                                                    <p className="text-center text-zinc-600 text-sm py-4">No items yet</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {topic.items.map((item) => (
                                                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${item.completed ? 'bg-emerald-500/5' : 'bg-elevated'}`}>
                                                                <button
                                                                    onClick={() => toggleDomainItem(domain.id, topic.id, item.id)}
                                                                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${item.completed ? 'bg-emerald-500 text-heading' : 'border-2 border-zinc-700 hover:border-blue-500'
                                                                        }`}
                                                                >
                                                                    {item.completed && '✓'}
                                                                </button>
                                                                <span className={`flex-1 text-sm ${item.completed ? 'text-emerald-400 line-through' : 'text-heading'}`}>{item.name}</span>
                                                                {domain.type === 'problem-based' && item.difficulty && (
                                                                    <span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase ${item.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                                                                        item.difficulty === 'hard' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'
                                                                        }`}>{item.difficulty}</span>
                                                                )}
                                                                <button onClick={() => deleteDomainItem(domain.id, topic.id, item.id)} className="p-1 text-zinc-600 hover:text-red-400">
                                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Progress Overview - Dynamic Domain Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {learningDomains.map((domain) => {
                    const totalItems = domain.topics?.reduce((sum, t) => sum + (t.items?.length || 0), 0) || 0;
                    const completedItems = domain.topics?.reduce((sum, t) => sum + (t.items?.filter(i => i.completed).length || 0), 0) || 0;
                    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                    const colorClass = {
                        violet: { ring: 'ring-sky-500/50', dot: 'bg-sky-500', bar: 'from-sky-600 to-sky-400', text: 'text-sky-400' },
                        emerald: { ring: 'ring-emerald-500/50', dot: 'bg-emerald-500', bar: 'from-emerald-600 to-emerald-400', text: 'text-emerald-400' },
                        blue: { ring: 'ring-blue-500/50', dot: 'bg-blue-500', bar: 'from-blue-600 to-blue-400', text: 'text-blue-400' },
                        amber: { ring: 'ring-amber-500/50', dot: 'bg-amber-500', bar: 'from-amber-600 to-amber-400', text: 'text-amber-400' },
                        pink: { ring: 'ring-pink-500/50', dot: 'bg-pink-500', bar: 'from-pink-600 to-pink-400', text: 'text-pink-400' },
                        cyan: { ring: 'ring-cyan-500/50', dot: 'bg-cyan-500', bar: 'from-cyan-600 to-cyan-400', text: 'text-cyan-400' },
                    }[domain.color] || { ring: 'ring-zinc-500/50', dot: 'bg-zinc-500', bar: 'from-zinc-600 to-zinc-400', text: 'text-zinc-400' };

                    return (
                        <div
                            key={domain.id}
                            className={`glass-card p-5 cursor-pointer transition-all relative group ${activeDomain === domain.id ? `ring-2 ${colorClass.ring}` : 'hover:border-subtle'}`}
                            onClick={() => setActiveDomain(activeDomain === domain.id ? null : domain.id)}
                        >
                            {/* Delete button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteLearningDomain(domain.id); }}
                                className="absolute top-3 right-3 p-1.5 rounded-lg bg-elevated opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Remove domain"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-2 h-2 rounded-full ${colorClass.dot}`}></div>
                                        <h3 className="text-sm font-semibold text-heading">{domain.name}</h3>
                                    </div>
                                    <p className="text-xs text-zinc-500">{domain.topics?.length || 0} topics · {totalItems} {domain.type === 'problem-based' ? 'problems' : 'items'}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-bold font-mono ${colorClass.text}`}>{completedItems}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{domain.type === 'problem-based' ? 'Solved' : 'Completed'}</p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="h-2 bg-elevated rounded-full overflow-hidden">
                                    <div className={`h-full bg-gradient-to-r ${colorClass.bar} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between mt-2">
                                    <span className="text-xs text-zinc-500">{progress}% complete</span>
                                    <span className="text-xs text-zinc-600">{totalItems - completedItems} remaining</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
export default Academics;
